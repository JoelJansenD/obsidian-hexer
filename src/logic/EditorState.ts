import { Icon } from "./icon";
import { PathNode } from "./path";

export type Layer = 'terrain' | 'icon' | 'river' | 'road';
export type PaintTool = 'select' | 'brush' | 'bucket' | 'eraser' | 'polygon';

export interface EditorState {
    activeColour: string;
    activeIcon: Icon;
    activeLayer: Layer;
    activePaintTool: PaintTool;
    /** The path currently being edited, or null when none is active. */
    activePath: EditorPathState | null;
}

export interface EditorPathState {
    pathId: string;
    activeNode: PathNode | null;
}