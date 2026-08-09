import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import IconBrushStrategy from "./IconBrushStrategy";
import IconBucketStrategy from "./IconBucketStrategy";
import IconEraserStrategy from "./IconEraserStrategy";
import PathPolygonStrategy from "./PathPolygonStrategy";
import TerrainBrushStrategy from "./TerrainBrushStrategy";
import TerrainBucketStrategy from "./TerrainBucketStrategy";
import TerrainEraserStrategy from "./TerrainEraserStrategy";

export type ToolEventHandler = (data: HexerData, editorState: EditorState, coordinates: RadialCoordinates) => void;

export type RegisteredEvents = {
    onLeftClick?: ToolEventHandler;
    onLeftDoubleClick?: ToolEventHandler;
    onLeftDrag?: ToolEventHandler;
    onRightClick?: ToolEventHandler;
}

export interface ToolStrategy {
    canBeApplied: (layer: Layer, tool: PaintTool) => boolean;
    getEvents: () => RegisteredEvents;
}

export type ToolStrategyFactory = () => ToolStrategy;
const toolStrategyFactories: ToolStrategyFactory[] = [
    () => new IconBrushStrategy(),
    () => new IconBucketStrategy(),
    () => new IconEraserStrategy(),
    () => new PathPolygonStrategy(),
    () => new TerrainBrushStrategy(),
    () => new TerrainBucketStrategy(),
    () => new TerrainEraserStrategy()
];

export function resolveToolStrategy(layer: Layer, tool: PaintTool): ToolStrategy | null {
    for (const createStrategy of toolStrategyFactories) {
        const strategy = createStrategy();
        if (strategy.canBeApplied(layer, tool)) {
            return strategy;
        }
    }
    return null;
}