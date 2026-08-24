import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { HexFieldLayerDescriptor } from "./hexFieldLayers";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

/** Flood-fills the descriptor's field across the region sharing the clicked value. */
export default class BucketStrategy<T> implements ToolStrategy {
    public readonly tool: PaintTool = 'bucket';
    public readonly layers: readonly Layer[];

    constructor(private readonly _field: HexFieldLayerDescriptor<T>) {
        this.layers = [_field.layer];
    }

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        const clickedHex = data.getHex(radialCoordinates);
        if(!clickedHex) {
            return;
        }

        const target = this._field.read(clickedHex);
        const area = getArea(radialCoordinates, (hex) => {
            const existing = data.getHex(hex);
            return existing !== undefined && this._field.equals(this._field.read(existing), target);
        });

        const value = this._field.valueFromState(editorState);
        area.forEach((hex) => {
            const hexagon = data.getHex(hex);
            if(hexagon) {
                this._field.write(hexagon, value);
                data.setHex(hexagon);
            }
        });
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
        };
    }
}
