import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class TerrainBucketStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return layer === 'terrain' && tool === 'bucket';
    }

    public onLeftClick(_hexMap: HexMap, _editorState: EditorState, _radialCoordinates: RadialCoordinates) {
        // TODO: implement flood fill of connected same-colour terrain hexes
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this)
        };
    }

}
