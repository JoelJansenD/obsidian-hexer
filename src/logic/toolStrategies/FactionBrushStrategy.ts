import { EditorState, Layer, PaintTool } from "../EditorState";
import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class FactionBrushStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'faction' && tool === 'brush';
    }

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(data, editorState, radialCoordinates);
    }

    public onLeftDrag(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(data, editorState, radialCoordinates);
    }

    private paint(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon: Hexagon = data.getOrCreateHex(radialCoordinates);
        hexagon.factionId = editorState.activeFactionId;
        data.setHex(hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
