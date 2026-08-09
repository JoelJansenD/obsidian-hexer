import { EditorState } from "../../logic/EditorState";
import { HexerData } from "../../logic/HexerData";
import { resolveToolStrategy } from "../../logic/toolStrategies/ToolStrategy";
import { ObsidianInterop } from "../ObsidianInterop";
import EditorCanvas from "./components/EditorCanvas";
import EditorSidebar from "./components/EditorSidebar";

export interface DataOptions {
    getDataClone: () => HexerData,
    setData: (data: HexerData) => void,
}

export interface ComponentOptions extends DataOptions {
    getEditorState: () => EditorState,
    setEditorState: (state: EditorState) => void,
    obsidian: ObsidianInterop,
}

export default class Editor {
    
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    private _editorState: EditorState = {
        activeColour: '#FFFFFF',
        activeIcon: {
            color: '#FFFFFF',
            name: 'castle'
        },
        activeLayer: 'terrain',
        activePaintTool: 'select',
        activePath: null
    };

    constructor(
        private _parentEl: HTMLElement,
        private _dataOptions: DataOptions,
        private _obsidian: ObsidianInterop,
    ) {
        this.build();
    }

    public setEditorState(state: EditorState) {
        this._editorState = state;
        this._canvas.unregisterEvents();

        const strategy = resolveToolStrategy(state.activeLayer, state.activePaintTool);
        if(strategy) {
            this._canvas.registerEvents(strategy);
        }
        this._canvas.requestRender();
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });

        const componentOptions: ComponentOptions = {
            ...this._dataOptions,
            obsidian: this._obsidian,
            getEditorState: () => this._editorState,
            setEditorState: state => this.setEditorState(state),
            setData: data => {
                this._dataOptions.setData(data);
                this._canvas.requestRender();
            }
        };
        this._canvas = new EditorCanvas(editorEl, componentOptions);
        this._sidebar = new EditorSidebar(editorEl, componentOptions);
    }
}