import { Icon } from "./icon";
import { PathNode } from "./path";

export type Layer = 'terrain' | 'icon' | 'river' | 'road' | 'faction';
export type PaintTool = 'select' | 'brush' | 'bucket' | 'eraser' | 'polygon';

/** The top-level editor mode: read-only View, or the full editing UI. */
export type ViewMode = 'view' | 'edit';

export interface EditorState {
    /**
     * View shows the map read-only (camera + action bar only); Edit adds the
     * full editing UI. Session-only UI state — never persisted, never in undo.
     */
    mode: ViewMode;
    activeColour: string;
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