import { Camera, panCamera, zoomCameraAt } from "./camera";
import { Point } from "./hexagon";

const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;

/** The cursor feedback the canvas shows for the current camera gesture. */
export type CameraCursor = 'grab' | 'grabbing' | null;

/**
 * Owns the camera gesture state — whether a pan is underway, whether Space arms
 * left-drag panning, and the last pointer seen — and turns pointer and wheel
 * input into camera updates through the pure camera functions. The view binds
 * DOM events to these methods and commits whatever camera they return; the
 * strategy holds no map data of its own.
 */
export class CameraStrategy {
    private spaceHeld = false;
    private lastPanPointer: Point | null = null;

    /** Whether a pan gesture is underway, so the caller can suppress the paint tool. */
    get isPanning(): boolean {
        return this.lastPanPointer !== null;
    }

    /** Grabbing mid-pan, grab when Space arms a pan, otherwise the tool's own cursor. */
    get cursor(): CameraCursor {
        if (this.isPanning) {
            return 'grabbing';
        }
        return this.spaceHeld ? 'grab' : null;
    }

    /** Tracks the Space key, which arms left-drag panning and shows grab feedback. */
    setSpaceHeld(held: boolean): void {
        this.spaceHeld = held;
    }

    /**
     * Begins a pan when the press is a pan gesture — the middle button, or the
     * left button while Space is held. Returns whether a pan began, so the caller
     * can keep the press from painting.
     */
    beginPan(button: number, pointer: Point): boolean {
        const isPanPress = button === MIDDLE_MOUSE_BUTTON
            || (button === LEFT_MOUSE_BUTTON && this.spaceHeld);
        if (!isPanPress) {
            return false;
        }
        this.lastPanPointer = pointer;
        return true;
    }

    /**
     * Pans by the drag since the last pointer, returning the moved camera, or
     * null if no pan is underway. Advances the tracked pointer so each move pans
     * by its own delta.
     */
    pan(camera: Camera, pointer: Point): Camera | null {
        if (this.lastPanPointer === null) {
            return null;
        }
        const delta = {
            x: pointer.x - this.lastPanPointer.x,
            y: pointer.y - this.lastPanPointer.y,
        };
        this.lastPanPointer = pointer;
        return panCamera(camera, delta);
    }

    /** Ends any in-progress pan. */
    endPan(): void {
        this.lastPanPointer = null;
    }

    /**
     * Zooms one notch per wheel event, anchored under the cursor: scrolling up
     * (a negative wheel delta) zooms in, scrolling down zooms out.
     */
    zoom(camera: Camera, cursor: Point, wheelDeltaY: number, viewportWidth: number, viewportHeight: number): Camera {
        const notches = wheelDeltaY < 0 ? 1 : -1;
        return zoomCameraAt(camera, cursor, notches, viewportWidth, viewportHeight);
    }
}
