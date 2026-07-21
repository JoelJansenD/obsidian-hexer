import { Icon } from "./icon";

export type Layer = 'terrain' | 'icon';
export type PaintTool = 'select' | 'brush' | 'bucket' | 'eraser';

export interface EditorState {
    activeColour: string;
    activeIcon: Icon;
    activeLayer: Layer;
    activePaintTool: PaintTool;
}