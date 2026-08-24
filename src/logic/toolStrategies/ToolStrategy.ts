import { EditorState, Layer, PaintTool } from "../EditorState";
import { AxialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import BrushStrategy from "./BrushStrategy";
import BucketStrategy from "./BucketStrategy";
import EraserStrategy from "./EraserStrategy";
import { HEX_FIELD_LAYER_DESCRIPTORS } from "./hexFieldLayers";
import PathPolygonStrategy from "./PathPolygonStrategy";

export type ToolEventHandler = (data: HexerData, editorState: EditorState, coordinates: AxialCoordinates) => void;

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

// One entry per (layer, tool) pairing. The hex-field layers get the three
// generic strategies, each bound to that layer's descriptor; rivers and roads
// share the polygon strategy. `create` runs lazily so resolving a tool builds
// only the strategy that is actually needed.
type ToolStrategyEntry = {
    tool: PaintTool;
    layer: Layer;
    create: () => ToolStrategy;
};

const toolStrategyEntries: ToolStrategyEntry[] = [
    ...HEX_FIELD_LAYER_DESCRIPTORS.flatMap((field): ToolStrategyEntry[] => [
        { tool: 'brush', layer: field.layer, create: () => new BrushStrategy(field) },
        { tool: 'bucket', layer: field.layer, create: () => new BucketStrategy(field) },
        { tool: 'eraser', layer: field.layer, create: () => new EraserStrategy(field) },
    ]),
    { tool: 'polygon', layer: 'river', create: () => new PathPolygonStrategy() },
    { tool: 'polygon', layer: 'road', create: () => new PathPolygonStrategy() },
];

export function resolveToolStrategy(layer: Layer, tool: PaintTool): ToolStrategy | null {
    const entry = toolStrategyEntries.find(candidate => candidate.tool === tool && candidate.layer === layer);
    return entry ? entry.create() : null;
}

export function getAvailableTools(layer: Layer): PaintTool[] {
    const tools = new Set<PaintTool>();
    for (const entry of toolStrategyEntries) {
        if (entry.layer === layer) {
            tools.add(entry.tool);
        }
    }
    return [...tools];
}