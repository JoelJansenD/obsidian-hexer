import { EditorState } from "../../logic/EditorState";
import { HexerData } from "../../logic/HexerData";
import { resolveToolStrategy } from "../../logic/toolStrategies/ToolStrategy";
import { ObsidianInterop } from "../ObsidianInterop";
import EditorCanvas from "./components/EditorCanvas";
import EditorSidebar from "./components/sidebar/EditorSidebar";

/** Extra context attached to a data commit. */
export interface CommitOptions {
    /**
     * Groups commits from a single pointer gesture into one undo entry, so a
     * whole brush drag collapses to one undo step. Omit for discrete edits.
     */
    stroke?: symbol,
}

export interface DataOptions {
    getDataClone: () => HexerData,
    setData: (data: HexerData, commit?: CommitOptions) => void,
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
        activePath: null,
        activeFactionId: null
    };

    constructor(
        private _parentEl: HTMLElement,
        private _dataOptions: DataOptions,
        private _obsidian: ObsidianInterop,
    ) {
        this.build();
    }

    /** Tears down the editor's components before the editor is discarded. */
    public destroy() {
        this._canvas.destroy();
    }

    /**
     * Redraws the canvas and re-renders data-driven sidebar lists. Called after
     * the underlying data is swapped out from outside a paint interaction — for
     * example when undo or redo restores an earlier map.
     */
    public refresh() {
        this._canvas.requestRender();
        this._sidebar.refresh();
    }

    public setEditorState(state: EditorState) {
        this._editorState = state;
        this._canvas.unregisterEvents();

        const strategy = resolveToolStrategy(state.activeLayer, state.activePaintTool);
        if(strategy) {
            this._canvas.registerEvents(strategy);
        }
        this._canvas.refreshTools();
        this._canvas.requestRender();
    }

    private build() {
        const editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });

        const componentOptions: ComponentOptions = {
            ...this._dataOptions,
            obsidian: this._obsidian,
            getEditorState: () => this._editorState,
            setEditorState: state => this.setEditorState(state),
            setData: (data, commit) => {
                this._dataOptions.setData(data, commit);
                this._canvas.requestRender();
            }
        };
        this._canvas = new EditorCanvas(editorEl, componentOptions);
        this._sidebar = new EditorSidebar(editorEl, componentOptions);
    }
}