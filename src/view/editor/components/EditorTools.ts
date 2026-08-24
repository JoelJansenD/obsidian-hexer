import { Brush, createElement, Eraser, IconNode, MousePointer2, PaintBucket, Pentagon } from "lucide";
import { PaintTool } from "../../../logic/EditorState";
import { getAvailableTools } from "../../../logic/toolStrategies/ToolStrategy";
import { ComponentOptions } from "../Editor";

export default class EditorTools {
    private _buttons = new Map<PaintTool, HTMLElement>();

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        const toolsEl = this._parentEl.createEl('div', { cls: 'hexer-tools' });
        const selectButton = this.createButton(toolsEl, MousePointer2, 'select');
        selectButton.classList.add('active');

        this.createButton(toolsEl, Brush, 'brush');
        this.createButton(toolsEl, PaintBucket, 'bucket');
        this.createButton(toolsEl, Eraser, 'eraser');
        this.createButton(toolsEl, Pentagon, 'polygon');

        this.refresh();
    }

    public refresh() {
        const activeLayer = this._componentOptions.getEditorState().activeLayer;
        const availableTools = getAvailableTools(activeLayer);
        for (const [tool, button] of this._buttons) {
            const isAvailable = tool === 'select' || availableTools.includes(tool);
            button.toggleClass('hexer-tools-button-hidden', !isAvailable);
        }
    }

    private createButton(toolsEl: HTMLElement, icon: IconNode, paintTool: PaintTool) {
        const button = toolsEl.createEl(
            'div',
            {
                cls: 'hexer-tools-button',
                attr: {
                    'data-hexer-paint-tool': paintTool
                }
            }
        );
        this._buttons.set(paintTool, button);
        button.appendChild(createElement(icon, { width: 18, height: 18 }));
        button.addEventListener('click', () => {
            toolsEl.querySelectorAll('.hexer-tools-button').forEach((b) => b.classList.remove('active'));
            
            const state = this._componentOptions.getEditorState();
            state.activePaintTool = paintTool;
            this._componentOptions.setEditorState(state);

            button.classList.add('active');
        });
        return button;
    }
}