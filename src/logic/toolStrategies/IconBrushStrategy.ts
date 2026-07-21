import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { hexKey, HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconBrushStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'icon' && tool === 'brush';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(hexMap, editorState, radialCoordinates);
    }

    public onLeftDrag(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(hexMap, editorState, radialCoordinates);
    }

    private paint(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const key = hexKey(radialCoordinates.q, radialCoordinates.r);
        const hex = hexMap.get(key) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null,
            icon: null
        };
        
        hex.icon = editorState.activeIcon;
        hexMap.set(key, hex);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
