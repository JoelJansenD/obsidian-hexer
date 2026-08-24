import { Point } from "./hexagon";

/** The viewport's current position over the map. */
export interface Camera {
    /**
     * Offset applied to the whole scene so the view can be panned, in CSS
     * pixels. A hex at map point 0,0 is drawn at this offset on the canvas.
     */
    offset: Point;
}

/** The camera a freshly created map starts with. */
export function defaultCamera(): Camera {
    return {
        offset: { x: 0, y: 0 },
    };
}
