import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class FactionEraserStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'eraser';
    public readonly layers: readonly Layer[] = ['faction'];

    public onLeftClick(data: HexerData, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(data, radialCoordinates);
    }

    public onLeftDrag(data: HexerData, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(data, radialCoordinates);
    }

    private erase(data: HexerData, radialCoordinates: RadialCoordinates) {
        const hexagon = data.getHex(radialCoordinates);
        if(!hexagon) {
            return;
        }

        hexagon.factionId = null;
        data.eraseIfEmpty(hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
