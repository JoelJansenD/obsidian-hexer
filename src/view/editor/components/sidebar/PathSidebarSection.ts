import EditorItemSidebarSection from "./EditorItemSidebarSection";
import { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import { Path } from "../../../../logic/path";

interface PathSidebarSectionOptions extends EditorListSidebarSectionOptions {
    /** Selects the paths array (rivers or roads) this section manages. */
    getPaths: (data: HexerData) => Path[];
}

/**
 * Lists the paths of a single layer (rivers or roads), tracking the active path
 * in the editor state. Shared by the river and road sections; the editable-item
 * lifecycle lives in {@link EditorItemSidebarSection}.
 */
export default class PathSidebarSection extends EditorItemSidebarSection<Path> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        private _pathOptions: PathSidebarSectionOptions,
    ) {
        super(parentEl, componentOptions, _pathOptions);
        this.renderItems();
    }

    protected getItems(data: HexerData): Path[] {
        return this._pathOptions.getPaths(data);
    }

    protected createItem(data: HexerData): Path {
        const path = new Path(this._pathOptions.newItemName);
        this._pathOptions.getPaths(data).push(path);
        return path;
    }

    // Saves search both path lists so an id resolves regardless of which layer's
    // section triggered the save.
    protected findItem(data: HexerData, id: string): Path | undefined {
        return [...data.rivers, ...data.roads].find(path => path.id === id);
    }

    protected getActiveId(): string | null {
        return this._componentOptions.getEditorState().activePath?.pathId ?? null;
    }

    protected setActiveId(id: string | null): void {
        const state = this._componentOptions.getEditorState();
        state.activePath = id === null ? null : { pathId: id, activeNode: null };
        this._componentOptions.setEditorState(state);
    }
}
