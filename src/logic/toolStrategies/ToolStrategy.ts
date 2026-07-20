import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import TerrainBrushStrategy from "./TerrainBrushStrategy";

export type ToolEventHandler = (hexMap: HexMap, editorState: EditorState, coordinates: RadialCoordinates) => void;

export type RegisteredEvents = {
    onLeftClick?: ToolEventHandler;
    onLeftDrag?: ToolEventHandler;
}

export interface ToolStrategy {
    canBeApplied: (layer: Layer, tool: PaintTool) => boolean;
    getEvents: () => RegisteredEvents;
}

const toolStrategies: ToolStrategy[] = [
    new TerrainBrushStrategy()
];

export function resolveToolStrategy(layer: Layer, tool: PaintTool): ToolStrategy | null {
    for (const strategy of toolStrategies) {
        if (strategy.canBeApplied(layer, tool)) {
            return strategy;
        }
    }
    return null;
}