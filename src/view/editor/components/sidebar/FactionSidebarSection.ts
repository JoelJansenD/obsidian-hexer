import { Faction } from "../../../../logic/faction";
import { ComponentOptions } from "../../Editor";
import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";

export class FactionSidebarSection extends EditorListSidebarSection<Faction> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions,
    ) {
        super(
            parentEl,
            componentOptions,
            options,
            data => data.factions,
            name => ({ id: crypto.randomUUID(), color: '#ff0000', name, filePath: null }),
        );
    }

    protected getActiveId(): string | null {
        return this._componentOptions.getEditorState().activeFactionId;
    }

    protected setActiveId(id: string | null): void {
        const state = this._componentOptions.getEditorState();
        state.activeFactionId = id;
        this._componentOptions.setEditorState(state);
    }
}
