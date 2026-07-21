import { EditorState } from "../../logic/EditorState";
import { HexerData } from "../../logic/HexerData";
import { resolveToolStrategy } from "../../logic/toolStrategies/ToolStrategy";
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
        activeColour: '#FF0000',
        activeIcon: {
            color: '#FF0000',
            name: 'castle'
        },
        activeLayer: 'terrain',
        activePaintTool: 'select'
    };

    constructor(private _parentEl: HTMLElement, private _dataOptions: DataOptions) {
        this.build();
    }

    public setEditorState(state: EditorState) {
        this._editorState = state;
        this._canvas.unregisterEvents();

        const strategy = resolveToolStrategy(state.activeLayer, state.activePaintTool);
        if(strategy) {
            this._canvas.registerEvents(strategy);
        }
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });

        const componentOptions: ComponentOptions = {
            ...this._dataOptions,
            getEditorState: () => this._editorState,
            setEditorState: ((state: EditorState) => this.setEditorState(state))
        };
        this._canvas = new EditorCanvas(editorEl, componentOptions);
        this._sidebar = new EditorSidebar(editorEl, componentOptions);
    }
}