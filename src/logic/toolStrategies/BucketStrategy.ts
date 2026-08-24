import { EditorState, Layer, PaintTool } from "../EditorState";
import { getArea, AxialCoordinates } from "../hexagon";
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

    public onLeftClick(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        const clickedHex = data.getHex(axialCoordinates);
        if(!clickedHex) {
            return;
        }

        const target = this._field.read(clickedHex);
        const area = getArea(axialCoordinates, (coordinates) => {
            const existing = data.getHex(coordinates);
            return existing !== undefined && this._field.equals(this._field.read(existing), target);
        });

        const value = this._field.valueFromState(editorState);
        area.forEach((coordinates) => {
            const hex = data.getHex(coordinates);
            if(hex) {
                this._field.write(hex, value);
                data.setHex(hex);
            }
        });
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
        };
    }
}
