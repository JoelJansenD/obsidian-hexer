import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconBrushStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'icon' && tool === 'brush';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        throw new Error("Not implemented");
    }

    public onLeftDrag(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        throw new Error("Not implemented");
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
