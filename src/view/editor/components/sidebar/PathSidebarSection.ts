import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import { Path, createPath } from "../../../../logic/path";

interface PathSidebarSectionOptions extends EditorListSidebarSectionOptions {
    /** Selects the paths array (rivers or roads) this section manages. */
    getPaths: (data: HexerData) => Path[];
}

/**
 * A sidebar section that lists the paths of a single layer (rivers or roads),
 * with an "add path" button. Shared by the river and road sections; everything
 * but the collection accessor and the active-path binding lives in
 * {@link EditorListSidebarSection}.
 */
export default class PathSidebarSection extends EditorListSidebarSection<Path> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: PathSidebarSectionOptions,
    ) {
        super(
            parentEl,
            componentOptions,
            options,
            options.getPaths,
            name => createPath(name),
        );
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
