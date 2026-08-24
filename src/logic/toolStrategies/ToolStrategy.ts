import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import FactionBrushStrategy from "./FactionBrushStrategy";
import FactionBucketStrategy from "./FactionBucketStrategy";
import FactionEraserStrategy from "./FactionEraserStrategy";
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
    readonly tool: PaintTool;
    readonly layers: readonly Layer[];
    getEvents: () => RegisteredEvents;
}

export type ToolStrategyFactory = () => ToolStrategy;
const toolStrategyFactories: ToolStrategyFactory[] = [
    () => new FactionBrushStrategy(),
    () => new FactionBucketStrategy(),
    () => new FactionEraserStrategy(),
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
        if (strategy.tool === tool && strategy.layers.includes(layer)) {
            return strategy;
        }
    }
    return null;
}

export function getAvailableTools(layer: Layer): PaintTool[] {
    const tools = new Set<PaintTool>();
    for (const createStrategy of toolStrategyFactories) {
        const strategy = createStrategy();
        if (strategy.layers.includes(layer)) {
            tools.add(strategy.tool);
        }
    }
    return [...tools];
}