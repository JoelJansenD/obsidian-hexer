import { screenToMap } from "../../../logic/camera";
import { getHex, pointToHex } from "../../../logic/HexerData";
import { hexagonIsEmpty } from "../../../logic/hexagon";
import { ComponentOptions } from "../Editor";

/**
 * View mode's double-click-to-open-note gesture, kept out of the canvas the way
 * the camera gestures are: the canvas owns the element, this owns the behaviour.
 * A double-click on a non-empty hex opens its note; blank cells and pans that
 * happen to end on a double-click are ignored.
 *
 * The listener is wired only while enabled (View mode). Edit mode leaves
 * double-click to the active tool (e.g. polygon connect), so the two never
 * contend for the gesture.
 */
export default class HexNoteNavigator {

    private _listener: EventListener | null = null;

    constructor(
        private _canvasEl: HTMLCanvasElement,
        private _dataOptions: ComponentOptions,
        // Reports whether a pan gesture is underway, so a pan that ends on a
        // double-click doesn't open a note.
        private _isPanning: () => boolean,
    ) { }

    /**
     * Wires (View mode) or unwires (Edit mode) the double-click gesture. A no-op
     * when the listener is already in the requested state.
     */
    public setEnabled(enabled: boolean) {
        if (enabled === (this._listener !== null)) {
            return;
        }
        if (enabled) {
            this._listener = (e) => this.openHexNoteAt(e as MouseEvent);
            this._canvasEl.addEventListener('dblclick', this._listener);
        } else {
            this._canvasEl.removeEventListener('dblclick', this._listener!);
            this._listener = null;
        }
    }

    /** Detaches the listener so the canvas can be discarded. */
    public destroy() {
        this.setEnabled(false);
    }

    // Hit-tests the double-clicked point and, when it lands on a non-empty hex,
    // asks the host to open that hex's note. Blank cells are a no-op, and a pan
    // that happens to end on a double-click is ignored.
    private openHexNoteAt(e: MouseEvent) {
        if (this._isPanning()) {
            return;
        }
        const data = this._dataOptions.getDataClone();
        const rect = this._canvasEl.getBoundingClientRect();
        const mapPoint = screenToMap(
            data.camera,
            { width: this._canvasEl.clientWidth, height: this._canvasEl.clientHeight },
            { x: e.clientX - rect.left, y: e.clientY - rect.top });
        const coordinate = pointToHex(data, mapPoint.x, mapPoint.y);
        const hex = getHex(data, coordinate);
        if (!hex || hexagonIsEmpty(hex)) {
            return;
        }
        this._dataOptions.obsidian.openHexNote({ coordinate, event: e });
    }
}
