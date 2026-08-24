import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconBrushStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'brush';
    public readonly layers: readonly Layer[] = ['icon'];

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(data, editorState, radialCoordinates);
    }

    public onLeftDrag(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(data, editorState, radialCoordinates);
    }

    private paint(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hex = data.getHex(radialCoordinates) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null,
            icon: null,
            factionId: null
        };

        hex.icon = {... editorState.activeIcon};
        data.setHex(hex);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
