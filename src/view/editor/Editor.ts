import { HexerData } from "../../logic/HexerData";
import EditorCanvas from "./components/EditorCanvas";
import EditorSidebar from "./components/EditorSidebar";

export interface DataOptions {
    getData: () => HexerData,
    setData: (data: HexerData) => void,
}

export default class Editor {
    
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    constructor(private _parentEl: HTMLElement, private _dataOptions: DataOptions) {
        this.build();
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });
        this._canvas = new EditorCanvas(editorEl, this._dataOptions);
        this._sidebar = new EditorSidebar(editorEl);
    }
}