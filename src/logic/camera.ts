import { Point } from "./hexagon";

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
