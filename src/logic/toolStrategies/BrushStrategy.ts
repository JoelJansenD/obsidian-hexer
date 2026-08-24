import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
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

    private paint(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon = data.getOrCreateHex(radialCoordinates);
        this._field.write(hexagon, this._field.valueFromState(editorState));
        data.setHex(hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.paint.bind(this),
            onLeftDrag: this.paint.bind(this),
        };
    }
}
