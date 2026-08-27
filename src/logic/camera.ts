import { Point } from "./hexagon";

/** The viewport's current position over the map. */
export interface Camera {
    /**
     * Pan offset from the viewport centre, in CSS pixels. The default of 0,0
     * keeps map point 0,0 (hex 0,0) centred in the canvas; panning the view
     * adjusts this offset. Kept centre-relative so it stays independent of the
     * canvas size across resizes and different screens.
     */
    offset: Point;
    /**
     * View magnification applied on top of the pan. `1` shows the map at its
     * natural scale; higher values magnify the view so less of the map fits in
     * the viewport, lower values show more of it. Pure view scale — it never
     * touches the map's intrinsic hex `size`.
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

/**
 * The camera's pan-and-zoom mapping between map space and screen space, both in
 * CSS pixels. Rendering configures the canvas from {@link origin} and
 * {@link scale}; hit-testing runs {@link toMap} on the cursor. Both come from
 * this one construction, so they cannot disagree about where a hex sits.
 */
export interface CameraTransform {
    /** Where map point (0,0) is drawn on screen: the viewport centre plus pan. */
    readonly origin: Point;
    /** The zoom magnification this transform applies. */
    readonly scale: number;
    /** Maps a point from map space to screen space. */
    toScreen(point: Point): Point;
    /** Maps a point from screen space back to map space. The inverse of {@link toScreen}. */
    toMap(point: Point): Point;
}

/**
 * Builds the {@link CameraTransform} for a camera over a viewport of the given
 * size. Map origin lands at the viewport centre shifted by the pan, and map
 * distances are scaled by the zoom around that origin.
 */
export function cameraTransform(camera: Camera, viewportWidth: number, viewportHeight: number): CameraTransform {
    const origin: Point = {
        x: viewportWidth / 2 + camera.offset.x,
        y: viewportHeight / 2 + camera.offset.y,
    };
    const scale = camera.zoom;
    return {
        origin,
        scale,
        toScreen: (point) => ({
            x: origin.x + scale * point.x,
            y: origin.y + scale * point.y,
        }),
        toMap: (point) => ({
            x: (point.x - origin.x) / scale,
            y: (point.y - origin.y) / scale,
        }),
    };
}
