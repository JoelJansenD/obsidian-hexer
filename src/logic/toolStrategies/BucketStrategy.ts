import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { HexLayerAccessor } from "./HexLayerAccessor";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class BucketStrategy implements ToolStrategy {
    public readonly tool: PaintTool = 'bucket';
    public readonly layers: readonly Layer[];

    constructor(private readonly accessor: HexLayerAccessor) {
        this.layers = [accessor.layer];
    }

    private fill(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const clickedHex = data.getHex(radialCoordinates);
        if(!clickedHex) {
            return;
        }

        const area = getArea(radialCoordinates, (hex) => {
            const existing = data.getHex(hex);
            return existing !== undefined && this.accessor.matches(existing, clickedHex);
        });

        area.forEach((hex) => {
            const hexagon = data.getHex(hex);
            if(hexagon) {
                this.accessor.apply(hexagon, editorState);
                data.setHex(hexagon);
            }
        });
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.fill.bind(this)
        };
    }

}
