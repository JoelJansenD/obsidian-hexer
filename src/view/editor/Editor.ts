import { EditorState } from "../../logic/EditorState";
import { HexerData } from "../../logic/HexerData";
import EditorCanvas from "./components/EditorCanvas";
import EditorSidebar from "./components/EditorSidebar";

export interface DataOptions {
    getData: () => HexerData,
    setData: (data: HexerData) => void,
}

export interface ComponentOptions extends DataOptions {
    getEditorState: () => EditorState,
    setEditorState: (state: EditorState) => void,
}

export default class Editor {
    
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    private _editorState: EditorState = {
        activeColour: '#000000',
        activeLayer: 'terrain',
        activePaintTool: 'select'
    };

    constructor(private _parentEl: HTMLElement, private _dataOptions: DataOptions) {
        this.build();
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });

        const componentOptions: ComponentOptions = {
            ...this._dataOptions,
            getEditorState: () => this._editorState,
            setEditorState: (state: EditorState) => { this._editorState = state; }
        };
        this._canvas = new EditorCanvas(editorEl, componentOptions);
        this._sidebar = new EditorSidebar(editorEl, componentOptions);
    }
}