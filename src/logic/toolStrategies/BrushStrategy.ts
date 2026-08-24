import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { HexLayerAccessor } from "./HexLayerAccessor";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class BrushStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'brush';
    public readonly layers: readonly Layer[];

    constructor(private readonly accessor: HexLayerAccessor) {
        this.layers = [accessor.layer];
    }

    private paint(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon = data.getOrCreateHex(radialCoordinates);
        this.accessor.apply(hexagon, editorState);
        data.setHex(hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.paint.bind(this),
            onLeftDrag: this.paint.bind(this)
        };
    }

}
