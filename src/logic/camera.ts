import { Point } from "./hexagon";
import { HexerData, hexToPoint } from "./HexerData";

/** The map region currently framed in the viewport: what we're looking at. */
export interface Camera {
    /**
     * The map point the camera is centred on, in map-space pixels — the same
     * space hex layout points live in. The default of 0,0 looks at the map
     * origin (hex 0,0). Being a map point it is resolution-independent, so it
     * survives canvas resizes and different screens.
     */
    offset: Point;
    /**
     * View magnification. `1` shows the map at its natural scale; higher values
     * magnify the view so less of the map fits in the viewport, lower values
     * show more of it. Pure view scale — it never touches the map's intrinsic
     * hex `size`.
     */
    zoom: number;
}

/** The zoom a freshly created or reset camera uses: the map at its natural scale. */
export const DEFAULT_ZOOM = 1;

/** The camera a freshly created map starts with, centred on hex 0,0, unscaled. */
export function defaultCamera(): Camera {
    return {
        offset: { x: 0, y: 0 },
        zoom: DEFAULT_ZOOM,
    };
}

/** The tightest and widest the wheel will zoom, and the multiplier per notch. */
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 1.1;

/**
 * Converts a map point to the screen point (CSS pixels, relative to the canvas)
 * it is drawn at: the camera centre lands at the viewport centre, and map
 * distances are scaled by the zoom around it. The renderer positions the scene
 * through this; {@link screenToMap} is its inverse.
 */
export function mapToScreen(camera: Camera, viewportWidth: number, viewportHeight: number, point: Point): Point {
    return {
        x: viewportWidth / 2 + camera.zoom * (point.x - camera.offset.x),
        y: viewportHeight / 2 + camera.zoom * (point.y - camera.offset.y),
    };
}

/**
 * Converts a point in screen space (CSS pixels, relative to the canvas) to the
 * map point drawn under it, inverting the pan and zoom the renderer applies:
 * reverse the viewport centring, undo the zoom, then re-add the camera centre.
 * Hit-testing runs this on the cursor, and {@link zoomCameraAt} on its anchor.
 */
export function screenToMap(camera: Camera, viewportWidth: number, viewportHeight: number, point: Point): Point {
    return {
        x: camera.offset.x + (point.x - viewportWidth / 2) / camera.zoom,
        y: camera.offset.y + (point.y - viewportHeight / 2) / camera.zoom,
    };
}

/**
 * Pans the camera by a pointer drag measured in screen pixels. The centre moves
 * opposite the drag so the grabbed point stays under the cursor, scaled into map
 * units by the current zoom.
 */
export function panCamera(camera: Camera, screenDelta: Point): Camera {
    return {
        offset: {
            x: camera.offset.x - screenDelta.x / camera.zoom,
            y: camera.offset.y - screenDelta.y / camera.zoom,
        },
        zoom: camera.zoom,
    };
}

/**
 * Zooms the camera by whole wheel notches, anchored so the map point under
 * `cursor` (a canvas-relative screen point) stays put. Each notch multiplies the
 * zoom by {@link ZOOM_STEP}, clamped to [{@link MIN_ZOOM}, {@link MAX_ZOOM}] —
 * except the lower bound relaxes to the current zoom, so a camera already below
 * the minimum (from {@link fitCamera}) can zoom back in but not further out.
 */
export function zoomCameraAt(camera: Camera, cursor: Point, notches: number, viewportWidth: number, viewportHeight: number): Camera {
    const candidate = camera.zoom * ZOOM_STEP ** notches;
    const lowerBound = Math.min(camera.zoom, MIN_ZOOM);
    const zoom = Math.min(Math.max(candidate, lowerBound), MAX_ZOOM);

    // Keep the anchor fixed: the map point under the cursor must map back to the
    // same screen point at the new zoom.
    const anchor = screenToMap(camera, viewportWidth, viewportHeight, cursor);
    return {
        offset: {
            x: anchor.x - (cursor.x - viewportWidth / 2) / zoom,
            y: anchor.y - (cursor.y - viewportHeight / 2) / zoom,
        },
        zoom,
    };
}

/**
 * Frames the whole map — every hex at its full extent plus every path node —
 * centred with about one hex of padding. The fit zoom is capped at
 * {@link MAX_ZOOM} but may drop below {@link MIN_ZOOM} so an oversized map fits
 * entirely rather than clipping. An empty map resets to {@link defaultCamera}.
 */
export function fitCamera(data: HexerData, viewportWidth: number, viewportHeight: number): Camera {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Hexes span their circumradius in every direction, so a hex at the edge is
    // framed whole rather than clipped at its centre.
    for (const hex of Object.values(data.hexes)) {
        const centre = hexToPoint(data, hex);
        minX = Math.min(minX, centre.x - data.size);
        minY = Math.min(minY, centre.y - data.size);
        maxX = Math.max(maxX, centre.x + data.size);
        maxY = Math.max(maxY, centre.y + data.size);
    }

    for (const path of [...data.rivers, ...data.roads]) {
        for (const node of Object.values(path.nodes)) {
            const point = hexToPoint(data, node);
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
    }

    if (minX === Infinity) {
        return defaultCamera();
    }

    const padding = data.size;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const rawFit = Math.min(viewportWidth / width, viewportHeight / height);

    return {
        offset: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
        zoom: Math.min(rawFit, MAX_ZOOM),
    };
}
