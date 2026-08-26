import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { eraseIfEmpty, getHex, HexerData } from "../HexerData";
import { HexLayerAccessor } from "./HexLayerAccessor";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class EraserStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'eraser';
    public readonly layers: readonly Layer[];

    constructor(private readonly accessor: HexLayerAccessor) {
        this.layers = [accessor.layer];
    }

    private erase(data: HexerData, _: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon = getHex(data, radialCoordinates);
        if(!hexagon) {
            return;
        }

        this.accessor.clear(hexagon);
        eraseIfEmpty(data, hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.erase.bind(this),
            onLeftDrag: this.erase.bind(this)
        };
    }

}
