import { EditorState } from "../../logic/EditorState";
import { HexerData } from "../../logic/HexerData";
import { resolveToolStrategy } from "../../logic/toolStrategies/ToolStrategy";
import { ObsidianInterop } from "../ObsidianInterop";
import EditorCanvas from "./components/EditorCanvas";
import EditorSidebar from "./components/sidebar/EditorSidebar";

/**
 * Access to the map data, which follows a clone-and-commit model: read a fresh
 * deep copy, mutate that copy, then hand it back to commit. Shared data is never
 * mutated in place.
 */
export interface DataOptions {
    /** Returns a fresh deep clone of the current map data to mutate freely. */
    getDataClone: () => HexerData,
    /** Commits mutated map data as the new current state and re-renders. */
    setData: (data: HexerData) => void,
}

export interface ComponentOptions extends DataOptions {
    /**
     * Returns the *live* editor-state object, not a copy. Editor state is the
     * transient editing selection (active layer, tool, colour, icon, faction and
     * in-progress path) and is mutated in place: read it, change fields, and they
     * take effect immediately for the next reader. This is deliberately the
     * opposite of the data layer's clone-and-commit model — editing state is
     * cheap, single-owner, and changes on nearly every interaction.
     */
    getEditorState: () => EditorState,
    /**
     * Commit signal for a change to the active layer or paint tool: re-wires the
     * canvas to that tool's event handlers and refreshes the tool bar and render.
     * Because {@link getEditorState} already returns the live object, callers pass
     * that same object back — the argument is the trigger, not a replacement.
     * Handlers that only change transient state (e.g. a path's active node) skip
     * this and let the canvas re-render on its own.
     */
    setEditorState: (state: EditorState) => void,
    obsidian: ObsidianInterop,
}

export default class Editor {
    
    private _canvas!: EditorCanvas;
    private _sidebar!: EditorSidebar;

    private _editorState: EditorState = {
        activeColor: '#FFFFFF',
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

    public setEditorState(state: EditorState) {
        // `state` is the live object callers have been mutating; the assignment is
        // a no-op in that case. The point of this call is to re-wire the canvas to
        // the (possibly changed) active layer/tool. See ComponentOptions.
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
            setData: data => {
                this._dataOptions.setData(data);
                this._canvas.requestRender();
            }
        };
        this._canvas = new EditorCanvas(editorEl, componentOptions);
        this._sidebar = new EditorSidebar(editorEl, componentOptions);
    }
}