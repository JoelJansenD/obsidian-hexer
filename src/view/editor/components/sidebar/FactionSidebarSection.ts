import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";

export interface Faction {
    id: string;
    name: string;
    color: string;
}

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
        throw new Error("Method not implemented.");
    }

    protected addItem(): void {
        throw new Error("Method not implemented.");
    }
    
    protected renderRow(listEl: HTMLElement, item: Faction): void {
        throw new Error("Method not implemented.");
    }
}
