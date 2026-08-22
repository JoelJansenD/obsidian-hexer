import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconEraserStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'icon' && tool === 'eraser';
    }

    public onLeftClick(data: HexerData, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(data, radialCoordinates);
    }

    public onLeftDrag(data: HexerData, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(data, radialCoordinates);
    }

    private erase(data: HexerData, radialCoordinates: RadialCoordinates) {
        const hex = data.getHex(radialCoordinates);
        if(!hex) {
            return;
        }

        hex.icon = null;
        data.eraseIfEmpty(hex);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
