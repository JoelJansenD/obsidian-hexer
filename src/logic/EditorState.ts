import { Icon } from "./icon";
import { PathNode } from "./path";

export type Layer = 'terrain' | 'icon' | 'river' | 'road' | 'faction';
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