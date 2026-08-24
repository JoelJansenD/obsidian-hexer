import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import BrushStrategy from "./BrushStrategy";
import BucketStrategy from "./BucketStrategy";
import EraserStrategy from "./EraserStrategy";
import { paintableLayerAccessors } from "./HexLayerAccessor";
import PathPolygonStrategy from "./PathPolygonStrategy";

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
    ...paintableLayerAccessors.flatMap((accessor) => [
        () => new BrushStrategy(accessor),
        () => new BucketStrategy(accessor),
        () => new EraserStrategy(accessor)
    ]),
    () => new PathPolygonStrategy()
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