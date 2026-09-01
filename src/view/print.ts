import { Camera, Viewport } from "../logic/camera";
import { EditorState } from "../logic/EditorState";
import { hexagonIsEmpty, Point } from "../logic/hexagon";
import { HexerData, hexToPoint } from "../logic/HexerData";
import render, { hexCorners } from "./render";

// Draw the map larger than the page needs and let the print driver downscale, so
// curves and borders stay crisp on paper. Hard-capped by MAX_PRINT_DIMENSION.
export const PRINT_SUPERSAMPLE = 3;

// A safe ceiling on either canvas dimension. Browsers refuse to allocate a
// backing store past a few thousand pixels a side; a map that would exceed this
// supersampled is drawn at a lower factor rather than crashing (issue #82, Q5).
export const MAX_PRINT_DIMENSION = 8192;

// A safe ceiling on the total backing-store area, guarding the memory/area limit
// the per-dimension cap alone misses: a near-square map can sit within
// MAX_PRINT_DIMENSION on each side yet still allocate 8192² ≈ 67M pixels (~268MB).
// 2^25 pixels (~34M, ~134MB) keeps even a square map comfortably allocatable
// while a very wide or tall one stays bounded by the dimension cap instead.
export const MAX_PRINT_AREA = 33_554_432;

// Grow the crop by half the widest stroke the renderer draws (paths, at
// size * 0.12) so a river/road cap or a faction border sitting on the extreme
// edge of the geometry doesn't clip (issue #82 framing detail).
export const PRINT_STROKE_MARGIN_SCALE = 0.06;

// The blank page an empty map prints to (Q10: no empty-map guard, just white).
const EMPTY_PRINT_DIMENSION = 512;

/** The tight crop, in map-space pixels, that a print render frames. */
export interface PrintBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/** Everything an offscreen print render needs: what to frame and how big to draw it. */
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

// The print render never highlights a selection, so paths draw without their
// active glow or node dots. render only reads `activePath`, but a full state
// keeps it honest against the type.
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
 * its corners (so an edge hex is framed whole, not sliced at its centre) and
 * every path node, grown by a hairline stroke margin. Pure, so the crop can be
 * unit-tested without a canvas. Returns null when nothing is drawn.
 */
export function computePrintBounds(data: HexerData): PrintBounds | null {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const expand = (point: Point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
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

    const margin = data.size * PRINT_STROKE_MARGIN_SCALE;
    return { minX: minX - margin, minY: minY - margin, maxX: maxX + margin, maxY: maxY + margin };
}

/**
 * Plans the offscreen print render for a map: the crop to frame, the camera that
 * frames it, and the supersampled canvas size — dropping below
 * {@link PRINT_SUPERSAMPLE} so an oversized map stays within
 * {@link MAX_PRINT_DIMENSION} rather than crashing. Pure. Null on an empty map.
 */
export function planPrintRender(data: HexerData): PrintPlan | null {
    const bounds = computePrintBounds(data);
    if (!bounds) {
        return null;
    }

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    // Frame the crop exactly: at zoom 1 with the viewport equal to the crop size,
    // a point at the crop's edge lands on the viewport's edge (see mapToScreen).
    // Downscale below the supersample factor for whichever limit bites first —
    // either canvas side against the dimension cap, or the whole area against the
    // area cap — so no map crashes the browser's canvas allocator.
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
 * guide — forced off, while coordinate labels and grid borders both keep
 * following their own display toggle, framed by the print camera. A deep clone,
 * so the live map is untouched.
 */
export function buildPrintData(data: HexerData, camera: Camera): HexerData {
    const clone = structuredClone(data);
    clone.camera = camera;
    clone.mapSettings.displayCrosshair = false;
    return clone;
}

/**
 * Renders the whole map to an offscreen canvas as a print-ready raster: a tight
 * crop, no editing guides, on a white background. An empty map yields a blank
 * white page (Q10). The canvas is detached; the caller turns it into an image.
 */
export function renderPrintCanvas(data: HexerData, doc: Document): HTMLCanvasElement {
    const canvas = doc.createElement('canvas');
    const plan = planPrintRender(data);

    if (!plan) {
        canvas.width = EMPTY_PRINT_DIMENSION;
        canvas.height = EMPTY_PRINT_DIMENSION;
        paintWhiteBehind(canvas.getContext('2d')!, canvas);
        return canvas;
    }

    canvas.width = plan.canvasWidth;
    canvas.height = plan.canvasHeight;
    const context = canvas.getContext('2d')!;

    // Draw in CSS-pixel (crop) coordinates while the backing store is `scale`
    // times larger, so the whole scene is supersampled. render layers the camera
    // transform on top of this base, exactly as the DPR transform on-screen.
    context.setTransform(plan.scale, 0, 0, plan.scale, 0, 0);
    render(context, buildPrintData(data, plan.camera), PRINT_EDITOR_STATE, plan.viewport);

    paintWhiteBehind(context, canvas);
    return canvas;
}

// Fills every pixel the render left transparent with white, so the raster carries
// its own white background rather than relying on the page behind it. Drawn behind
// the existing content via destination-over, at the identity transform so the fill
// covers the whole backing store regardless of the supersample scale in force.
function paintWhiteBehind(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

// The self-contained print document's stylesheet: a white, no-chrome page with
// the map image centred and scaled to fit (Q6-Q9), orientation hinted from the
// map's shape.
function printStyles(orientation: 'landscape' | 'portrait'): string {
    return `
@page { size: ${orientation}; margin: 0; }
html, body { margin: 0; padding: 0; height: 100%; background: #ffffff; }
.page { display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; background: #ffffff; }
img { max-width: 100%; max-height: 100%; object-fit: contain; }`;
}

/**
 * Renders the whole map and hands it to the operating system's print dialog
 * (which doubles as Save-as-PDF). Prints a hidden iframe holding only the map
 * image on a white page — never the Obsidian window — with the orientation
 * hinted from the map's shape; the user can override it in the dialog.
 *
 * The frame's document is built by DOM manipulation of its existing about:blank
 * document, never via `document.write`: an Electron webview refuses to show a
 * print preview for a written-into frame ("this app doesn't support print
 * preview"), but prints a DOM-built one fine.
 */
export function printMap(data: HexerData, doc: Document): void {
    const canvas = renderPrintCanvas(data, doc);
    const imageUrl = canvas.toDataURL('image/png');
    const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';

    const iframe = doc.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Print map');
    iframe.tabIndex = -1;
    // Keep the frame out of the layout, but not via display:none, which can stop
    // a browser from wiring up the frame's print document at all.
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    doc.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!frameDoc || !frameWindow) {
        iframe.remove();
        return;
    }

    frameDoc.head.replaceChildren();
    frameDoc.body.replaceChildren();

    const style = frameDoc.createElement('style');
    style.textContent = printStyles(orientation);
    frameDoc.head.appendChild(style);

    const page = frameDoc.createElement('div');
    page.className = 'page';
    const image = frameDoc.createElement('img');
    image.alt = 'Map';
    page.appendChild(image);
    frameDoc.body.appendChild(page);

    // Tear the frame down once the dialog closes; a fallback timer covers the case
    // where afterprint never fires (e.g. a cancelled Save-as-PDF).
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) {
            return;
        }
        cleaned = true;
        frameWindow.removeEventListener('afterprint', cleanup);
        iframe.remove();
    };
    frameWindow.addEventListener('afterprint', cleanup, { once: true });
    (doc.defaultView ?? window).setTimeout(cleanup, 60_000);

    // Print only once the image has decoded, or the page prints blank. Guarded so
    // the load listener and the already-complete check can't both fire it.
    let printed = false;
    const print = () => {
        if (printed) {
            return;
        }
        printed = true;
        frameWindow.focus();
        frameWindow.print();
    };
    image.addEventListener('load', print, { once: true });
    image.addEventListener('error', print, { once: true });
    image.src = imageUrl;
    if (image.complete) {
        print();
    }
}
