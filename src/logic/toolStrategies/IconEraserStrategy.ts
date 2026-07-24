import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconEraserStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'icon' && tool === 'eraser';
    }

    public onLeftClick(hexMap: HexMap, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(hexMap, radialCoordinates);
    }

    public onLeftDrag(hexMap: HexMap, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(hexMap, radialCoordinates);
    }

    private erase(hexMap: HexMap, radialCoordinates: RadialCoordinates) {
        // TODO: implement
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
