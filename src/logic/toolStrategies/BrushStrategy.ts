import { EditorState, Layer, PaintTool } from "../EditorState";
import { AxialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { HexFieldLayerDescriptor } from "./hexFieldLayers";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

/** Paints the descriptor's field on the hovered hex with the active value. */
export default class BrushStrategy<T> implements ToolStrategy {
    public readonly tool: PaintTool = 'brush';
    public readonly layers: readonly Layer[];

    constructor(private readonly _field: HexFieldLayerDescriptor<T>) {
        this.layers = [_field.layer];
    }

    private paint(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        const hex = data.getOrCreateHex(axialCoordinates);
        this._field.write(hex, this._field.valueFromState(editorState));
        data.setHex(hex);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.paint.bind(this),
            onLeftDrag: this.paint.bind(this),
        };
    }
}
