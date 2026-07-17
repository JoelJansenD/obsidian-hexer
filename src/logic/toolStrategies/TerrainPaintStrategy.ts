import { EditorState } from "../EditorState";
import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { ToolStrategy } from "./ToolStrategy";

export default class TerrainPaintStrategy implements ToolStrategy {

    public onClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const hexagon: Hexagon = hexMap.get(`${radialCoordinates.q},${radialCoordinates.r}`) || {
            q: radialCoordinates.q,
            r: radialCoordinates.r,
            terrainColor: null
        };
        hexagon.terrainColor = editorState.activeColour;
        hexMap.set(`${radialCoordinates.q},${radialCoordinates.r}`, hexagon);
    }
    
    public getEvents() {
        return {
            click: this.onClick
        };
    }

}