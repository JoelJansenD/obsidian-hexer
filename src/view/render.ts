import { EditorPathState, EditorState } from "../logic/EditorState";
import { Hexagon, radialCoordinatesToPoint } from "../logic/hexagon";
import { HexerData } from "../logic/HexerData";
import { HEXER_ICONS } from "../logic/icon";
import { Path } from "../logic/path";

export default function render(context: CanvasRenderingContext2D, data: HexerData, editorState: EditorState) {
    // Clear the full backing store regardless of the current DPR transform.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();

    for(const hex of data.hexes.values()) {
        drawHex(context, hex, data.size);
        drawIcon(context, hex, data.size);
    }

    for(const path of [...data.rivers, ...data.roads]) {
        drawPath(context, path, data.size, editorState.activePath);
    }
}

function drawHex(context: CanvasRenderingContext2D, hex: Hexagon, size: number) {
    const hexCenter = radialCoordinatesToPoint(hex, size);

    context.beginPath();
    for(let cornerIdx = 0; cornerIdx < 6; cornerIdx++) {
        const degree = 60 * cornerIdx;
        const angle = (Math.PI / 180) * degree;

        const cornerX = hexCenter.x + size * Math.cos(angle);
        const cornerY = hexCenter.y + size * Math.sin(angle);

        if(cornerIdx === 0) {
            context.moveTo(cornerX, cornerY);
        } else {
            context.lineTo(cornerX, cornerY);
        }
    }
    context.closePath();

    if(hex.terrainColor) {
        context.fillStyle = hex.terrainColor;
        context.fill();
    }

    context.stroke();
}

function drawIcon(context: CanvasRenderingContext2D, hex: Hexagon, size: number) {
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
    const hexCenter = radialCoordinatesToPoint(hex, size);
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

function drawPath(context: CanvasRenderingContext2D, path: Path, size: number, activePath: EditorPathState | null) {
    context.save();

    const edges = path.edges;
    context.strokeStyle = path.id === activePath?.path.id ? '#ffcc00' : '#ff0000';
    for(const edge of edges) {
        const pathNodes = path.getFullEdgePath(edge);
        console.log(pathNodes);
        context.beginPath();
        for(let i = 0; i < pathNodes.length; i++) {
            const point = radialCoordinatesToPoint(pathNodes[i], size);
            if(i === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        }
        context.stroke();
    }

    if(path.id === activePath?.path.id) {
        const nodes = path.nodes;
        const nodeRadius = size * 0.15;

        for(const node of nodes.values()) {
            const center = radialCoordinatesToPoint(node, size);
            const isActive = activePath.activeNode?.q === node.q && activePath.activeNode?.r === node.r;

            context.beginPath();
            context.arc(center.x, center.y, nodeRadius, 0, Math.PI * 2);
            context.fillStyle = isActive ? '#ffcc00' : '#ffffff';
            context.fill();
            context.stroke();
        }
    }

    context.restore();
}
