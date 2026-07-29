import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class PathPolygonStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return (layer === 'river' || layer === 'road') && tool === 'polygon';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
        };
    }

}
