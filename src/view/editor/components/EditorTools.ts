import { Brush, createElement, Eraser, IconNode, MousePointer2, PaintBucket } from "lucide";

export type PaintTool = 'select' | 'brush' | 'bucket' | 'erase';

export default class EditorTools {
    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const toolsEl = this._parentEl.createEl('div', { cls: 'hexer-tools' });
        const selectButton = this.createButton(toolsEl, MousePointer2, 'select');
        selectButton.classList.add('active');

        this.createButton(toolsEl, Brush, 'brush');
        this.createButton(toolsEl, PaintBucket, 'bucket');
        this.createButton(toolsEl, Eraser, 'erase');
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
        button.appendChild(createElement(icon, { width: 18, height: 18 }));
        button.addEventListener('click', () => {
            toolsEl.querySelectorAll('.hexer-tools-button').forEach((b) => b.classList.remove('active'));
            button.classList.add('active');
        });
        return button;
    }
}