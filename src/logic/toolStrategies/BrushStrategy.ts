import { EditorState, Layer, PaintTool } from "../EditorState";
import { AxialCoordinates } from "../hexagon";
import { getOrCreateHex, HexerData, setHex } from "../HexerData";
import { HexLayerAccessor } from "./HexLayerAccessor";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class BrushStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'brush';
    public readonly layers: readonly Layer[];

    constructor(private readonly accessor: HexLayerAccessor) {
        this.layers = [accessor.layer];
    }

    private paint(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        const hexagon = getOrCreateHex(data, axialCoordinates);
        this.accessor.apply(hexagon, editorState);
        setHex(data, hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.paint.bind(this),
            onLeftDrag: this.paint.bind(this)
        };
    }

}
