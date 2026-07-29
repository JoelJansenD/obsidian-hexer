import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainBucketStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'bucket';
    }

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const clickedHex = data.getHex(radialCoordinates);
        if(!clickedHex) {
            return;
        }

        const area = getArea(radialCoordinates, (hex) => {
            const existing = data.getHex(hex);
            return existing !== undefined && existing.terrainColor === clickedHex.terrainColor;
        });

        area.forEach((hex) => {
            const hexagon = data.getHex(hex);
            if(hexagon) {
                hexagon.terrainColor = editorState.activeColour;
                data.setHex(hexagon);
            }
        });
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this)
        };
    }

}
