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

// The size of the transparent canvas an empty map renders to: the white print
// page shows through it as a blank page (Q10: no empty-map guard, just white).
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
 * crop, no editing guides. Transparent where nothing is drawn; the white print
 * page behind it (see PRINT_STYLES) supplies the background, so an empty map
 * renders to a blank white page (Q7, Q10). The caller turns it into an image.
 */
function renderPrintCanvas(data: HexerData, doc: Document): HTMLCanvasElement {
    const canvas = doc.createElement('canvas');
    const plan = planPrintRender(data);

    if (!plan) {
        canvas.width = canvas.height = EMPTY_PRINT_DIMENSION;
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
    return canvas;
}

// Marks the elements the print flow injects into the host document, so cleanup
// removes exactly what it added and the print stylesheet can target them.
const PRINT_ROOT_CLASS = 'hexer-print-root';

// A print-only stylesheet that turns the live Obsidian document into the print
// page: hide the whole window and show just the map image, centred and scaled to
// fit on white with no chrome (Q6-Q9). Scoped to `@media print` and display:none
// off-screen, so injecting it never disturbs the editor. Paired with
// webContents.print (see ObsidianInterop.print), which renders the current page
// in print mode — window.print itself routes through a print-preview shell
// Obsidian's Electron doesn't support ("this app doesn't support print preview").
const PRINT_STYLES = `
.${PRINT_ROOT_CLASS} { display: none; }
@media print {
    @page { margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
    body > *:not(.${PRINT_ROOT_CLASS}) { display: none !important; }
    .${PRINT_ROOT_CLASS} {
        display: flex !important;
        position: fixed;
        inset: 0;
        align-items: center;
        justify-content: center;
        background: #ffffff;
    }
    .${PRINT_ROOT_CLASS} img { max-width: 100%; max-height: 100%; object-fit: contain; }
}`;

/** A prepared print page: how to orient it, when its image is ready, and how to remove it. */
export interface PrintJob {
    /** Whether the page should hint landscape orientation, from the map's shape. */
    landscape: boolean;
    /** Resolves once the map image has decoded, so printing never captures a blank page. */
    imageReady: Promise<void>;
    /** Removes the injected elements. Idempotent; call once printing has returned. */
    cleanup: () => void;
}

/**
 * Prepares the whole-map print page in `doc`: renders the map to a raster and
 * injects it behind the print-only stylesheet that hides everything else. The
 * caller awaits `imageReady`, hands the page to the OS via the Obsidian layer's
 * `print`, then calls `cleanup`. The actual print call is separate because it
 * needs Electron, which only the Obsidian layer may reach.
 */
export function renderPrintDocument(data: HexerData, doc: Document): PrintJob {
    const canvas = renderPrintCanvas(data, doc);
    const landscape = canvas.width >= canvas.height;

    const style = doc.createElement('style');
    style.textContent = PRINT_STYLES;
    doc.head.appendChild(style);

    const root = doc.createElement('div');
    root.className = PRINT_ROOT_CLASS;
    root.setAttribute('aria-hidden', 'true');
    const image = doc.createElement('img');
    image.alt = 'Map';
    root.appendChild(image);
    doc.body.appendChild(root);

    const imageReady = new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
        image.src = canvas.toDataURL('image/png');
        if (image.complete) {
            resolve();
        }
    });

    let cleaned = false;
    const cleanup = () => {
        if (cleaned) {
            return;
        }
        cleaned = true;
        root.remove();
        style.remove();
    };

    return { landscape, imageReady, cleanup };
}
