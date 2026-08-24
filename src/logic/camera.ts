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
}

/** The camera a freshly created map starts with, centred on hex 0,0. */
export function defaultCamera(): Camera {
    return {
        offset: { x: 0, y: 0 },
    };
}

/**
 * The point on the canvas that map point 0,0 is drawn at: the viewport centre
 * shifted by the camera's pan. Returned in CSS pixels, matching the coordinate
 * space drawing and hit-testing work in. Both the renderer and click handling
 * go through this so they agree on where each hex sits.
 */
export function cameraViewOffset(camera: Camera, viewportWidth: number, viewportHeight: number): Point {
    return {
        x: viewportWidth / 2 + camera.offset.x,
        y: viewportHeight / 2 + camera.offset.y,
    };
}
