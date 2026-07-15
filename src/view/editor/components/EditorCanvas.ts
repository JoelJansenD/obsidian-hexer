import EditorTools from "./EditorTools";

export default class EditorCanvas {
    private _tools!: EditorTools;

    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const canvasAreaEl = this._parentEl.createEl('div', { cls: 'hexer-canvas-area' });
        const canvasEl = canvasAreaEl.createEl('canvas', { cls: 'hexer-canvas' });
        
        this._tools = new EditorTools(canvasAreaEl);
    }
}