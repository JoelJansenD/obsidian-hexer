import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, RadialCoordinates } from "../hexagon";
import { hexKey, HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconBucketStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'icon' && tool === 'bucket';
    }

    public onLeftClick(hexMap: HexMap, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const clickedHex = hexMap.get(hexKey(radialCoordinates.q, radialCoordinates.r));
        if(!clickedHex) {
            return;
        }

        const area = getArea(radialCoordinates, (hex) => {
            const existing = hexMap.get(hexKey(hex.q, hex.r));
            return existing !== undefined && existing.icon?.name === clickedHex.icon?.name;
        });

        area.forEach((hex) => {
            const key = hexKey(hex.q, hex.r);
            const hexagon = hexMap.get(key);
            if(hexagon) {
                hexagon.icon = {...editorState.activeIcon};
                hexMap.set(key, hexagon);
            }
        });
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this)
        };
    }

}
