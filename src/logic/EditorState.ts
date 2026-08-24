import { Icon } from "./icon";
import { PathNode } from "./path";

/** Layers backed by a single field of a {@link Hexagon}, painted with brush/bucket/eraser. */
export type HexFieldLayer = 'terrain' | 'icon' | 'faction';
/** Layers backed by a Path graph, painted with the polygon tool. */
export type PathLayer = 'river' | 'road';
export type Layer = HexFieldLayer | PathLayer;
export type PaintTool = 'select' | 'brush' | 'bucket' | 'eraser' | 'polygon';

export interface EditorState {
    activeColor: string;
    activeIcon: Icon;
    activeLayer: Layer;
    activePaintTool: PaintTool;
    activePath: EditorPathState | null;
    activeFactionId: string | null;
}

export interface EditorPathState {
    pathId: string;
    activeNode: PathNode | null;
}