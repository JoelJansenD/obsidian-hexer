import { EditorState, Mode } from "../../logic/EditorState";
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
    /**
     * Whether the commit records an undo entry. Defaults to true; pass false for
     * a camera-only move, which still persists and saves but must not become its
     * own undo step (see ADR-0010).
     */
    commitHistory?: boolean,
}

export interface DataOptions {
    getDataClone: () => HexerData,
    setData: (data: HexerData, commit?: CommitOptions) => void,
}

export interface ComponentOptions extends DataOptions {
    getEditorState: () => EditorState,
    setEditorState: (state: EditorState) => void,
    toggleMode: () => void,
    obsidian: ObsidianInterop,
}

/**
 * The edit-related editor state as it stands on a fresh load. Switching modes
 * re-applies these defaults, so returning to Edit always starts clean — select
 * tool, terrain layer, nothing selected. Mode is supplied by the caller because
 * it is the one field a mode switch is deliberately changing, not resetting.
 */
function createEditorState(mode: Mode): EditorState {
    return {
        mode,
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
}

export default class Editor {

    private _editorEl!: HTMLElement;
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    // Every map opens read-only in view mode.
    private _editorState: EditorState = createEditorState('view');

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

    /** The current top-level mode. Read-only enforcement (undo/redo) gates on this. */
    public getMode(): Mode {
        return this._editorState.mode;
    }

    /**
     * Flips between View and Edit. Switching resets the edit-related state to its
     * load-time defaults, so returning to Edit starts fresh; the camera is
     * untouched (it lives in the map). Session-only — never persisted or undone.
     */
    public toggleMode() {
        const nextMode: Mode = this._editorState.mode === 'view' ? 'edit' : 'view';
        const nextState = createEditorState(nextMode);
        this.setEditorState(nextState);

        // setEditorState re-wires events and visibility from the reset state; the
        // sidebar's expanded layer and the tool cluster's highlight are UI-only, so
        // point them back at the defaults too, keeping the reset fully visible.
        this._sidebar.showLayer(nextState.activeLayer);
        this._canvas.setActiveTool(nextState.activePaintTool);
    }

    public setEditorState(state: EditorState) {
        this._editorState = state;
        const editing = state.mode === 'edit';

        this._editorEl.dataset.hexerMode = state.mode;

        // View mode is camera-only: unwire any paint interactions and don't wire
        // new ones. Edit mode wires the active tool's strategy as before.
        this._canvas.unregisterEvents();
        if (editing) {
            const strategy = resolveToolStrategy(state.activeLayer, state.activePaintTool);
            if(strategy) {
                this._canvas.registerEvents(strategy);
            }
        }

        // The action bar stays in both modes; the sidebar and paint-tool cluster
        // show only in Edit.
        this._sidebar.setVisible(editing);
        this._canvas.setMode(state.mode);
        this._canvas.refreshTools();
        this._canvas.requestRender();
    }

    private build() {
        this._editorEl = this._parentEl.createEl('div', { cls: 'hexer-editor' });

        const componentOptions: ComponentOptions = {
            ...this._dataOptions,
            obsidian: this._obsidian,
            getEditorState: () => this._editorState,
            setEditorState: state => this.setEditorState(state),
            toggleMode: () => this.toggleMode(),
            setData: (data, commit) => {
                this._dataOptions.setData(data, commit);
                this._canvas.requestRender();
            }
        };
        this._canvas = new EditorCanvas(this._editorEl, componentOptions);
        this._sidebar = new EditorSidebar(this._editorEl, componentOptions);

        // Apply the initial (view) mode so the sidebar and tools start hidden and
        // the action bar shows the enter-edit affordance.
        this.setEditorState(this._editorState);
    }
}