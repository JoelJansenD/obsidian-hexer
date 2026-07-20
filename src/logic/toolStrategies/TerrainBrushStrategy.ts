import { EditorState, Layer, PaintTool } from "../EditorState";
import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainBrushStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'brush';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon: Hexagon = hexMap.get(`${radialCoordinates.q},${radialCoordinates.r}`) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null
        };
        hexagon.terrainColor = editorState.activeColour;
        hexMap.set(`${radialCoordinates.q},${radialCoordinates.r}`, hexagon);
    }

    public onLeftDrag(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon: Hexagon = hexMap.get(`${radialCoordinates.q},${radialCoordinates.r}`) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null
        };
        hexagon.terrainColor = editorState.activeColour;
        hexMap.set(`${radialCoordinates.q},${radialCoordinates.r}`, hexagon);
    }
    
    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick,
            onLeftDrag: this.onLeftDrag
        };
    }

}