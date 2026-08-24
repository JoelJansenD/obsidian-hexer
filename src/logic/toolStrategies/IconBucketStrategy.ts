import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class IconBucketStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'bucket';
    public readonly layers: readonly Layer[] = ['icon'];

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const clickedHex = data.getHex(radialCoordinates);
        if(!clickedHex) {
            return;
        }

        const area = getArea(radialCoordinates, (hex) => {
            const existing = data.getHex(hex);
            return existing !== undefined
                && existing.icon?.name === clickedHex.icon?.name
                && existing.icon?.color === clickedHex.icon?.color;
        });

        area.forEach((hex) => {
            const hexagon = data.getHex(hex);
            if(hexagon) {
                hexagon.icon = {...editorState.activeIcon};
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
