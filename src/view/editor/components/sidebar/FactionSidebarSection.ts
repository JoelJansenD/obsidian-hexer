import { Faction } from "../../../../logic/faction";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";

export class FactionSidebarSection extends EditorListSidebarSection<Faction> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions
    ) {
        super(parentEl, componentOptions, options);
        this.renderItems();
    }

    protected getItems(data: HexerData): Faction[] {
        return data.factions;
    }

    protected addItem(): void {
        const data = this._componentOptions.getDataClone();
        data.factions.push({
            id: crypto.randomUUID(),
            color: '#ff0000',
            name: 'New faction'
        });
        this._componentOptions.setData(data);
    }
    
    protected renderRow(listEl: HTMLElement, item: Faction): void {
        listEl.createDiv({ text: item.name, cls: 'hexer-faction-row' });
    }
}
