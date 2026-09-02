import { Camera, Viewport } from "../logic/camera";
import { EditorState } from "../logic/EditorState";
import { hexagonIsEmpty, Point } from "../logic/hexagon";
import { HexerData, hexToPoint } from "../logic/HexerData";
import render, { hexCorners } from "./render";

// Draw the map larger than a page needs and let the print driver scale it down,
// so curves and thin borders stay crisp on paper. Bounded by the caps below.
export const PRINT_SUPERSAMPLE = 3;

// A safe ceiling on either canvas side. Browsers refuse to allocate a backing
// store past a few thousand pixels a side, so a map that would exceed this when
// supersampled is drawn at a smaller factor instead of crashing (issue #82, Q5).
export const MAX_PRINT_DIMENSION = 8192;

// A safe ceiling on the total backing-store area. The per-side cap alone misses
// the memory limit a near-square map hits: 8192² is ~67M pixels (~268MB) even
// though neither side breaches MAX_PRINT_DIMENSION. Capping at 2^25 pixels
// (~34M, ~134MB) keeps a square map allocatable while a very wide or tall one
// stays bounded by the dimension cap instead.
export const MAX_PRINT_AREA = 33_554_432;

// Grow the crop past the raw geometry so a path running along the very edge of
// the map isn't clipped (issue #82 framing detail). computePrintBounds frames
// only path *node* points, but paths draw as wavy lines displaced perpendicular
// to the node polyline: up to the river amplitude (size * 0.18, the widest —
// see render.ts) at interior nodes, since the wave only tapers to zero at a
// path's two extreme endpoints. Add half the path stroke on top (lineWidth
// size * 0.12) so the outer edge of that bulge still lands inside the crop.
export const PRINT_EDGE_MARGIN_SCALE = 0.18 + 0.06;

// The blank white square an empty map prints to (Q10: no empty-map guard).
const EMPTY_PRINT_DIMENSION = 512;

/** The tight crop, in map-space pixels, that a print render frames. */
export interface PrintBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/** Everything an offscreen print render needs: what to frame, and how big to draw it. */
export interface PrintPlan {
    /** The synthesized camera that frames the crop, always at zoom 1. */
    camera: Camera;
    /** The crop size in CSS pixels — the viewport handed to {@link render}. */
    viewport: Viewport;
    /** The backing-store size in device pixels: the viewport times {@link scale}. */
    canvasWidth: number;
    canvasHeight: number;
    /** The supersample factor actually used, at or below {@link PRINT_SUPERSAMPLE}. */
    scale: number;
}

// The print render never shows a selection, so paths draw without the active
// glow and node dots. render only reads `activePath`, but a whole state keeps
// this honest against the type.
const PRINT_EDITOR_STATE: EditorState = {
    mode: 'view',
    activeColour: '#ffffff',
    activeIcon: { color: '#ffffff', name: 'castle' },
    activeLayer: 'terrain',
    activePaintTool: 'select',
    activePath: null,
    activeFactionId: null,
};

/**
 * The bounding box of the map's actually-drawn geometry: every non-empty hex by
 * its corners (so an edge hex is framed whole, not sliced through its centre) and
 * every path node, grown by a hairline stroke margin. Pure, so the crop can be
 * unit-tested without a canvas. Returns null when nothing is drawn.
 */
export function computePrintBounds(data: HexerData): PrintBounds | null {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const expand = ({ x, y }: Point) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    };

    for (const hex of Object.values(data.hexes)) {
        if (hexagonIsEmpty(hex)) {
            continue;
        }
        for (const corner of hexCorners(hexToPoint(data, hex), data.size, data.mapSettings.hexOrientation)) {
            expand(corner);
        }
    }

    for (const path of [...data.rivers, ...data.roads]) {
        for (const node of Object.values(path.nodes)) {
            expand(hexToPoint(data, node));
        }
    }

    if (minX === Infinity) {
        return null;
    }

    const margin = data.size * PRINT_EDGE_MARGIN_SCALE;
    return { minX: minX - margin, minY: minY - margin, maxX: maxX + margin, maxY: maxY + margin };
}

/**
 * Plans the offscreen print render: the crop to frame, the camera that frames
 * it, and the supersampled canvas size — dropping below {@link PRINT_SUPERSAMPLE}
 * when either the dimension or the area cap would otherwise be breached, so no
 * map crashes the browser's canvas allocator. Pure. Null on an empty map.
 */
export function planPrintRender(data: HexerData): PrintPlan | null {
    const bounds = computePrintBounds(data);
    if (!bounds) {
        return null;
    }

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    // At zoom 1 with the viewport equal to the crop, a point on the crop's edge
    // lands on the viewport's edge (see mapToScreen), so the crop frames exactly.
    // The scale is the supersample factor pulled back by whichever cap bites
    // first: either side against the dimension cap, or the whole area against the
    // area cap (its square root, since the scale grows both sides at once).
    const scale = Math.min(
        PRINT_SUPERSAMPLE,
        MAX_PRINT_DIMENSION / width,
        MAX_PRINT_DIMENSION / height,
        Math.sqrt(MAX_PRINT_AREA / (width * height)),
    );

    return {
        camera: { offset: { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 }, zoom: 1 },
        viewport: { width, height },
        canvasWidth: Math.max(1, Math.round(width * scale)),
        canvasHeight: Math.max(1, Math.round(height * scale)),
        scale,
    };
}

/**
 * The map as it should render for print: the crosshair — a pure cursor/origin
 * guide — forced off, while coordinate labels and grid borders each keep
 * following their own display toggle, framed by the print camera. A deep clone,
 * so the live map is left untouched.
 */
export function buildPrintData(data: HexerData, camera: Camera): HexerData {
    const clone = structuredClone(data);
    clone.camera = camera;
    clone.mapSettings.displayCrosshair = false;
    return clone;
}

/**
 * Renders the whole map to an offscreen canvas as a print-ready raster: a tight
 * crop, no editing guides, on its own white background so the image never relies
 * on the print renderer honouring the page's CSS background. An empty map yields
 * a blank white square (Q7, Q10). The caller turns it into an image.
 */
function renderPrintCanvas(data: HexerData, doc: Document): HTMLCanvasElement {
    const canvas = doc.createElement('canvas');
    const plan = planPrintRender(data);

    if (!plan) {
        canvas.width = canvas.height = EMPTY_PRINT_DIMENSION;
        paintWhiteBehind(canvas.getContext('2d')!, canvas);
        return canvas;
    }

    canvas.width = plan.canvasWidth;
    canvas.height = plan.canvasHeight;
    const context = canvas.getContext('2d')!;

    // Draw in CSS-pixel (crop) coordinates while the backing store is `scale`
    // times larger, so the whole scene is supersampled. render layers its camera
    // transform on top of this base, exactly as the DPR transform does on-screen.
    context.setTransform(plan.scale, 0, 0, plan.scale, 0, 0);
    render(context, buildPrintData(data, plan.camera), PRINT_EDITOR_STATE, plan.viewport);

    paintWhiteBehind(context, canvas);
    return canvas;
}

// Fills every pixel the render left transparent with white, so the raster carries
// its own background rather than trusting the print page behind it (which not
// every PDF/print renderer paints). Drawn behind the existing pixels with
// destination-over, at the identity transform so it covers the whole backing
// store regardless of the supersample scale in force.
function paintWhiteBehind(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

/** The print-ready map raster plus the page orientation its shape suggests. */
export interface PrintImage {
    /** The whole-map raster as a PNG data URL, white-backed and tightly cropped. */
    dataUrl: string;
    /** Whether the page should hint landscape orientation, from the map's shape. */
    landscape: boolean;
}

/**
 * Renders the whole map to a print-ready PNG data URL. The Obsidian layer loads
 * it into an isolated window and prints that — printing Obsidian's own document
 * comes back blank, because its styles suppress the injected page. Pure view
 * work: no Electron, no mutation of the live map.
 */
export function buildPrintImage(data: HexerData, doc: Document): PrintImage {
    const canvas = renderPrintCanvas(data, doc);
    return { dataUrl: canvas.toDataURL('image/png'), landscape: canvas.width >= canvas.height };
}
