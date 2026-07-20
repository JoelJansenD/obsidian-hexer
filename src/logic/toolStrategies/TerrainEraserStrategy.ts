import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainEraserStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'eraser';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        // TODO: implement erase on left click
    }

    public onLeftDrag(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        // TODO: implement erase on left drag
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
