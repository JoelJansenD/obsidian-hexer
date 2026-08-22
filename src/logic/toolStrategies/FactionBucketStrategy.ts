import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class FactionBucketStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'faction' && tool === 'bucket';
    }

    public onLeftClick(_data: HexerData, _editorState: EditorState, _radialCoordinates: RadialCoordinates) {
        throw new Error('Not implemented');
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this)
        };
    }

}
