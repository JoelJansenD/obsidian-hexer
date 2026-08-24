import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { HexFieldLayerDescriptor } from "./hexFieldLayers";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

/** Clears the descriptor's field on the hovered hex, dropping the hex if empty. */
export default class EraserStrategy<T> implements ToolStrategy {
    public readonly tool: PaintTool = 'eraser';
    public readonly layers: readonly Layer[];

    constructor(private readonly _field: HexFieldLayerDescriptor<T>) {
        this.layers = [_field.layer];
    }

    private erase(data: HexerData, _editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon = data.getHex(radialCoordinates);
        if(!hexagon) {
            return;
        }

        this._field.write(hexagon, null);
        data.eraseIfEmpty(hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.erase.bind(this),
            onLeftDrag: this.erase.bind(this),
        };
    }
}
