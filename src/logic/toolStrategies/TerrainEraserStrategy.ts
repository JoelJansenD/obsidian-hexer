import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { hexKey, HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainEraserStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'eraser';
    }

    public onLeftClick(hexMap: HexMap, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(hexMap, radialCoordinates);
    }

    public onLeftDrag(hexMap: HexMap, _: EditorState, radialCoordinates: RadialCoordinates) {
        this.erase(hexMap, radialCoordinates);
    }

    private erase(hexMap: HexMap, radialCoordinates: RadialCoordinates) {
        const key = hexKey(radialCoordinates.q, radialCoordinates.r);
        const hexagon = hexMap.get(key);
        if(!hexagon) {
            return;
        }

        hexagon.terrainColor = null;
        hexMap.set(key, hexagon);
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this)
        };
    }

}
