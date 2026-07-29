import { Icon } from "./icon";
import { Path, PathNode } from "./path";

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
    path: Path;
    activeNode: PathNode | null;
}