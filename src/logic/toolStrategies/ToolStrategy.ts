import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import IconBrushStrategy from "./IconBrushStrategy";
import IconBucketStrategy from "./IconBucketStrategy";
import IconEraserStrategy from "./IconEraserStrategy";
import PathPolygonStrategy from "./PathPolygonStrategy";
import TerrainBrushStrategy from "./TerrainBrushStrategy";
import TerrainBucketStrategy from "./TerrainBucketStrategy";
import TerrainEraserStrategy from "./TerrainEraserStrategy";

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
    new IconBrushStrategy(),
    new IconBucketStrategy(),
    new IconEraserStrategy(),
    new PathPolygonStrategy(),
    new TerrainBrushStrategy(),
    new TerrainBucketStrategy(),
    new TerrainEraserStrategy()
];

export function resolveToolStrategy(layer: Layer, tool: PaintTool): ToolStrategy | null {
    for (const strategy of toolStrategies) {
        if (strategy.canBeApplied(layer, tool)) {
            return strategy;
        }
    }
    return null;
}