import { cameraViewOffset } from "../logic/camera";
import { EditorPathState, EditorState } from "../logic/EditorState";
import { Hexagon, Point, RadialCoordinates, radialCoordinatesToPoint } from "../logic/hexagon";
import { HexerData } from "../logic/HexerData";
import { HexOrientation } from "../logic/mapSettings";
import { HEXER_ICONS } from "../logic/icon";
import { Path, PathEdge, PathNode, PathType } from "../logic/path";

// Neighbour of a hex across each of its six edges, indexed by edge: edge `i`
// runs from corner `i` to corner `i + 1`. Used to decide which edges of a
// faction hex sit on the region's outer boundary.
const EDGE_NEIGHBOURS: RadialCoordinates[] = [
    { q: 1, r: 0 },   // corner 0 -> 1
    { q: 0, r: 1 },   // corner 1 -> 2
    { q: -1, r: 1 },  // corner 2 -> 3
    { q: -1, r: 0 },  // corner 3 -> 4
    { q: 0, r: -1 },  // corner 4 -> 5
    { q: 1, r: -1 },  // corner 5 -> 0
];

export default function render(context: CanvasRenderingContext2D, data: HexerData, editorState: EditorState) {
    // Clear the full backing store regardless of the current DPR transform.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();

    // Pan the whole scene so hex 0,0 (which sits at point 0,0) lands where the
    // camera points: the viewport centre shifted by the camera's pan. The
    // translate stacks on top of the DPR transform set on resize.
    const offset = cameraViewOffset(data.camera, context.canvas.clientWidth, context.canvas.clientHeight);
    context.save();
    context.translate(offset.x, offset.y);

    const orientation = data.mapSettings.hexOrientation;

    for(const hex of data.hexes.values()) {
        drawHexTerrain(context, hex, data.size, orientation);
    }

    // Borders are a separate pass after every terrain fill so a neighbour's fill
    // never paints over an already-drawn border. The default grid border can be
    // toggled off in the map settings.
    if(data.mapSettings.displayHexBorders) {
        for(const hex of data.hexes.values()) {
            drawHexBorder(context, hex, data.size, orientation);
        }
    }

    // Factions sit above the terrain but below the icons, so paint them as a
    // pass of their own between the two per-hex passes.
    drawFactions(context, data, data.size);

    for(const hex of data.hexes.values()) {
        drawIcon(context, hex, data.size, orientation);
    }

    for(const path of data.rivers) {
        drawPath(context, path, data.size, editorState.activePath, 'river', orientation);
    }
    for(const path of data.roads) {
        drawPath(context, path, data.size, editorState.activePath, 'road', orientation);
    }

    if(data.mapSettings.displayCrosshair) {
        drawCrosshair(context, data.size);
    }

    context.restore();
}

// Draws a crosshair centred on hex 0,0 as a map-origin guide. Each arm reaches
// from the centre to roughly the hex's edge (~one circumradius) plus another
// half a hex of overshoot, so the marker reads clearly around the hex rather
// than being buried inside it.
function drawCrosshair(context: CanvasRenderingContext2D, size: number) {
    const center = radialCoordinatesToPoint({ q: 0, r: 0 }, size);
    const reach = size * 1.5;

    context.save();
    context.strokeStyle = 'rgba(128, 128, 128, 0.9)';
    context.lineWidth = Math.max(1, size * 0.03);
    context.beginPath();
    context.moveTo(center.x - reach, center.y);
    context.lineTo(center.x + reach, center.y);
    context.moveTo(center.x, center.y - reach);
    context.lineTo(center.x, center.y + reach);
    context.stroke();
    context.restore();
}

function hexCorners(center: Point, size: number, orientation: HexOrientation): Point[] {
    // Flat-top hexes have a corner pointing along +x (angle 0); pointy-top hexes
    // are the same ring rotated so a corner points up instead, which is a -30°
    // shift. The shift is chosen so corner `i` -> `i + 1` still faces the same
    // neighbour direction in both orientations, keeping EDGE_NEIGHBOURS valid.
    const cornerOffset = orientation === 'pointy-top' ? -30 : 0;
    const corners: Point[] = [];
    for(let cornerIdx = 0; cornerIdx < 6; cornerIdx++) {
        const angle = (Math.PI / 180) * (60 * cornerIdx + cornerOffset);
        corners.push({
            x: center.x + size * Math.cos(angle),
            y: center.y + size * Math.sin(angle),
        });
    }
    return corners;
}

function traceHex(context: CanvasRenderingContext2D, corners: Point[]) {
    context.beginPath();
    corners.forEach((corner, cornerIdx) => {
        if(cornerIdx === 0) {
            context.moveTo(corner.x, corner.y);
        } else {
            context.lineTo(corner.x, corner.y);
        }
    });
    context.closePath();
}

function drawHexTerrain(context: CanvasRenderingContext2D, hex: Hexagon, size: number, orientation: HexOrientation) {
    if(!hex.terrainColor) {
        return;
    }

    traceHex(context, hexCorners(radialCoordinatesToPoint(hex, size, orientation), size, orientation));
    context.fillStyle = hex.terrainColor;
    context.fill();

    // Adjacent fills leave a faint antialiased seam that the grid border used to
    // hide. Stroke the fill in its own color so each hex covers its half of the
    // seam, keeping neighbours flush even when borders are toggled off.
    context.save();
    context.strokeStyle = hex.terrainColor;
    context.lineWidth = 1;
    context.stroke();
    context.restore();
}

function drawHexBorder(context: CanvasRenderingContext2D, hex: Hexagon, size: number, orientation: HexOrientation) {
    traceHex(context, hexCorners(radialCoordinatesToPoint(hex, size, orientation), size, orientation));
    context.stroke();
}

function drawFactions(context: CanvasRenderingContext2D, data: HexerData, size: number) {
    if(data.factions.length === 0) {
        return;
    }

    const factionsById = new Map(data.factions.map(faction => [faction.id, faction]));
    const orientation = data.mapSettings.hexOrientation;

    context.save();

    // Translucent fill so the terrain underneath stays visible. Fill every hex
    // in a region first, before any borders are drawn.
    context.globalAlpha = 0.2;
    for(const hex of data.hexes.values()) {
        const faction = hex.factionId ? factionsById.get(hex.factionId) : undefined;
        if(!faction) {
            continue;
        }

        traceHex(context, hexCorners(radialCoordinatesToPoint(hex, size, orientation), size, orientation));
        context.fillStyle = faction.color;
        context.fill();
    }

    // Then stroke only the edges that face a hex of a different (or no) faction,
    // leaving shared internal edges borderless so a region reads as one shape.
    // The border is drawn opaque in the faction's own color.
    context.globalAlpha = 1;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const borderWidth = size * 0.08;
    for(const hex of data.hexes.values()) {
        const faction = hex.factionId ? factionsById.get(hex.factionId) : undefined;
        if(!faction) {
            continue;
        }

        const corners = hexCorners(radialCoordinatesToPoint(hex, size, orientation), size, orientation);

        const borderEdges: [Point, Point][] = [];
        for(let edge = 0; edge < 6; edge++) {
            const modifier = EDGE_NEIGHBOURS[edge];
            const neighbour = data.getHex(hex.q + modifier.q, hex.r + modifier.r);
            if(neighbour?.factionId === hex.factionId) {
                continue;
            }

            borderEdges.push([corners[edge], corners[(edge + 1) % 6]]);
        }

        if(borderEdges.length === 0) {
            continue;
        }

        // The stroke is centred on the edge, so clip to the hex and draw at
        // double width: only the inner half survives, keeping the whole border
        // inside the hex.
        context.save();
        traceHex(context, corners);
        context.clip();

        context.beginPath();
        for(const [from, to] of borderEdges) {
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
        }
        context.lineWidth = borderWidth * 2;
        context.strokeStyle = faction.color;
        context.stroke();
        context.restore();
    }

    context.restore();
}

function drawIcon(context: CanvasRenderingContext2D, hex: Hexagon, size: number, orientation: HexOrientation) {
    if(!hex.icon) {
        return;
    }

    const icon = HEXER_ICONS.get(hex.icon.name);
    if(!icon) {
        // TODO: display warning to user
        return;
    }

    const svgEl = new DOMParser().parseFromString(icon, "image/svg+xml").documentElement;
    const [vbX, vbY, vbWidth, vbHeight] = (svgEl.getAttribute('viewBox') ?? '0 0 512 512')
        .split(/\s+/)
        .map(Number);
    const hexCenter = radialCoordinatesToPoint(hex, size, orientation);
    const iconSize = size * 1.2;
    const scale = iconSize / Math.max(vbWidth, vbHeight);

    context.save();
    context.translate(hexCenter.x - (vbWidth * scale) / 2, hexCenter.y - (vbHeight * scale) / 2);
    context.scale(scale, scale);
    context.translate(-vbX, -vbY);
    context.fillStyle = hex.icon.color;

    svgEl.querySelectorAll('path').forEach((pathEl) => {
        context.save();
        context.fill(new Path2D(pathEl.getAttribute('d') ?? ''));
        context.restore();
    });

    context.restore();
}

function drawPath(context: CanvasRenderingContext2D, path: Path, size: number, activePath: EditorPathState | null, type: PathType, orientation: HexOrientation) {
    context.save();

    const isActive = path.id === activePath?.pathId;
    context.strokeStyle = path.color;
    context.lineWidth = size * 0.12;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if(isActive) {
        context.shadowColor = path.color;
        context.shadowBlur = size * 0.15;
    }

    // Both sweep in smooth, broad curves; rivers bend far harder than roads.
    const amplitude = type === 'river' ? size * 0.18 : size * 0.1;
    const wavelength = type === 'river' ? size * 2.0 : size * 1.6;

    for(const polyline of buildPathPolylines(path)) {
        const points = polyline.map(node => radialCoordinatesToPoint(node, size, orientation));
        drawWavyLine(context, points, amplitude, wavelength);
    }

    if(isActive) {
        const nodes = path.nodes;
        const nodeRadius = size * 0.15;

        for(const node of nodes.values()) {
            const center = radialCoordinatesToPoint(node, size, orientation);
            const isActiveNode = activePath.activeNode?.q === node.q && activePath.activeNode?.r === node.r;

            context.beginPath();
            context.arc(center.x, center.y, nodeRadius, 0, Math.PI * 2);
            context.fillStyle = isActiveNode ? '#ffcc00' : '#ffffff';
            context.fill();
            context.stroke();
        }
    }

    context.restore();
}

// Traces a path's edge graph into connected chains of hex points. Degree-2
// nodes are followed through so a run of edges becomes one continuous polyline;
// each junction (degree != 2) and each loop starts a fresh chain.
function buildPathPolylines(path: Path): PathNode[][] {
    const edges = path.edges;
    if(edges.length === 0) {
        return [];
    }

    // nodeKey -> incident edges, as { edgeIndex, otherKey }.
    const adjacency = new Map<string, { edgeIndex: number, otherKey: string }[]>();
    edges.forEach((edge, index) => {
        const getOrSetAdjacency = (node: string) => {
            if(!adjacency.has(node)) {
                adjacency.set(node, []);
            }
            return adjacency.get(node)!;
        };
        getOrSetAdjacency(edge.from).push({ edgeIndex: index, otherKey: edge.to });
        getOrSetAdjacency(edge.to).push({ edgeIndex: index, otherKey: edge.from });
    });

    const usedEdges = new Set<number>();

    // Expands an edge into its hex points, oriented to start at `startKey`.
    const edgePoints = (edgeIndex: number, startKey: string): PathNode[] => {
        const full = path.getFullEdgePath(edges[edgeIndex]);
        return edges[edgeIndex].from === startKey ? full : full.slice().reverse();
    };

    // Walks a maximal chain from `startKey` along `firstEdgeIndex`, continuing
    // through degree-2 nodes until it hits a junction, a dead end, or a used edge.
    const walkChain = (startKey: string, firstEdgeIndex: number): PathNode[] => {
        const points: PathNode[] = [];
        let currentKey = startKey;
        let edgeIndex = firstEdgeIndex;
        while(true) {
            usedEdges.add(edgeIndex);
            const segment = edgePoints(edgeIndex, currentKey);
            // Drop the shared node on continuation to avoid duplicating it.
            points.push(...(points.length === 0 ? segment : segment.slice(1)));

            const nextKey = edges[edgeIndex].from === currentKey ? edges[edgeIndex].to : edges[edgeIndex].from;
            const neighbours = adjacency.get(nextKey) ?? [];
            if(neighbours.length !== 2) {
                break;
            }
            const next = neighbours.find(n => !usedEdges.has(n.edgeIndex));
            if(!next) {
                break;
            }
            currentKey = nextKey;
            edgeIndex = next.edgeIndex;
        }
        return points;
    };

    const polylines: PathNode[][] = [];

    // Chains anchored at endpoints and junctions (degree != 2).
    for(const [nodeKey, neighbours] of adjacency) {
        if(neighbours.length === 2) {
            continue;
        }
        for(const neighbour of neighbours) {
            if(!usedEdges.has(neighbour.edgeIndex)) {
                polylines.push(walkChain(nodeKey, neighbour.edgeIndex));
            }
        }
    }

    edges.forEach((edge, index) => {
        if(!usedEdges.has(index)) {
            polylines.push(walkChain(edge.from, index));
        }
    });

    return polylines;
}

// Draws a polyline with a perpendicular sine displacement so the straight
// hex-to-hex segments read as a flowing, curved path. The displacement is
// tapered to zero at both endpoints so an edge always starts and ends exactly
// on its node points, letting adjacent edges of the same path join seamlessly.
function drawWavyLine(context: CanvasRenderingContext2D, points: { x: number, y: number }[], amplitude: number, wavelength: number) {
    if(points.length < 2) {
        return;
    }

    const stepsPerSegment = 8;
    // Total length of the polyline, used to place the endpoint taper window.
    let totalLength = 0;
    for(let i = 0; i < points.length - 1; i++) {
        totalLength += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    if(totalLength === 0) {
        return;
    }

    let distance = 0;
    let started = false;

    context.beginPath();
    for(let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const segmentLength = Math.hypot(dx, dy) || 1;
        // Unit vector perpendicular to the segment.
        const perpX = -dy / segmentLength;
        const perpY = dx / segmentLength;
        for(let step = (i === 0 ? 0 : 1); step <= stepsPerSegment; step++) {
            const t = step / stepsPerSegment;
            const along = distance + segmentLength * t;
            // Sine envelope: 0 at both endpoints, 1 at the middle.
            const taper = Math.sin((along / totalLength) * Math.PI);
            const offset = Math.sin((along / wavelength) * Math.PI * 2) * amplitude * taper;
            const x = a.x + dx * t + perpX * offset;
            const y = a.y + dy * t + perpY * offset;
            if(started) {
                context.lineTo(x, y);
            } else {
                context.moveTo(x, y);
                started = true;
            }
        }
        distance += segmentLength;
    }
    context.stroke();
}
