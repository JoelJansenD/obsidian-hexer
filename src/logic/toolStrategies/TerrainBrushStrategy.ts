import { EditorState, Layer, PaintTool } from "../EditorState";
import { Hexagon, RadialCoordinates } from "../hexagon";
import { hexKey, HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainBrushStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'brush';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(hexMap, editorState, radialCoordinates);
    }

    public onLeftDrag(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        this.paint(hexMap, editorState, radialCoordinates);
    }

    private paint(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const key = hexKey(radialCoordinates.q, radialCoordinates.r);
        const hexagon: Hexagon = hexMap.get(key) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null,
            icon: null
        };
        hexagon.terrainColor = editorState.activeColour;
        hexMap.set(key, hexagon);
    }
    
    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}