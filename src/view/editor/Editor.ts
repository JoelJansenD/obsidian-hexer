import EditorCanvas from "./EditorCanvas";
import EditorSidebar from "./EditorSidebar";

export default class Editor {
    
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });
        this._canvas = new EditorCanvas(editorEl);
        this._sidebar = new EditorSidebar(editorEl);
    }
}