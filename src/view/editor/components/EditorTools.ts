import { Brush, createElement, Eraser, MousePointer2, PaintBucket } from "lucide";

export default class EditorTools {
    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const toolsEl = this._parentEl.createEl('div', { cls: 'hexer-tools' });

        const selectButton = toolsEl.createEl('div', { cls: 'hexer-tools-button active' });
        selectButton.appendChild(createElement(MousePointer2, { width: 18, height: 18 }));

        const brushButton = toolsEl.createEl('div', { cls: 'hexer-tools-button' });
        brushButton.appendChild(createElement(Brush, { width: 18, height: 18 }));

        const bucketButton = toolsEl.createEl('div', { cls: 'hexer-tools-button' });
        bucketButton.appendChild(createElement(PaintBucket, { width: 18, height: 18 }));

        const eraseButton = toolsEl.createEl('div', { cls: 'hexer-tools-button' });
        eraseButton.appendChild(createElement(Eraser, { width: 18, height: 18 }));
    }
}