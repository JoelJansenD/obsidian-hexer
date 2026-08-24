import { Faction } from "../../../../logic/faction";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import EditorItemSidebarSection from "./EditorItemSidebarSection";
import { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";

/** Lists the map's factions, tracking the active one in the editor state. */
export class FactionSidebarSection extends EditorItemSidebarSection<Faction> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions,
    ) {
        super(parentEl, componentOptions, options);
        this.renderItems();
    }

    protected getItems(data: HexerData): Faction[] {
        return data.factions;
    }

    protected createItem(data: HexerData): Faction {
        const faction: Faction = {
            id: crypto.randomUUID(),
            color: '#ff0000',
            name: this._listOptions.newItemName,
            filePath: null,
        };
        data.factions.push(faction);
        return faction;
    }

    protected findItem(data: HexerData, id: string): Faction | undefined {
        return data.factions.find(faction => faction.id === id);
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
