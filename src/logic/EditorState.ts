export type Layer = 'terrain' | 'icon';
export type PaintTool = 'select' | 'brush' | 'bucket' | 'eraser';

export interface EditorState {
    activeColour: string;
    activeLayer: Layer;
    activePaintTool: PaintTool;
}