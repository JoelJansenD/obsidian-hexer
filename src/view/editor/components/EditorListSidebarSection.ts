import { createElement, Plus } from "lucide";
import EditorSidebarSection, { EditorSidebarSectionOptions } from "./EditorSidebarSection";
import { HexerData } from "../../../logic/HexerData";
import { ComponentOptions } from "../Editor";

export interface EditorListSidebarSectionOptions extends EditorSidebarSectionOptions {
    /** Text shown on the add button. */
    addLabel: string;
    /** dataset.role for the add button, e.g. 'add-river'. */
    addRole: string;
}

/**
 * A sidebar section that lists a layer's items with an "add" button. The item
 * type, how items are read from the data, how a new one is created and how each
 * row renders are all left to subclasses, so the same list scaffolding can back
 * any layer (rivers, roads, ...) regardless of the item type.
 */
export default abstract class EditorListSidebarSection<TItem> extends EditorSidebarSection {
    private _listEl!: HTMLDivElement;

    constructor(
        parentEl: HTMLElement,
        protected _componentOptions: ComponentOptions,
        listOptions: EditorListSidebarSectionOptions,
    ) {
        super(parentEl, listOptions);

        const addButton = this.contentEl.createDiv({ cls: 'hexer-sidebar-add-path' });
        addButton.dataset.role = listOptions.addRole;
        addButton.appendChild(createElement(Plus, { height: 14, width: 14 }));
        addButton.createEl('span', { text: listOptions.addLabel });
        addButton.addEventListener('click', this.addItem.bind(this));

        this._listEl = this.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        // The initial render is triggered by the subclass once its own fields are
        // set: rendering reads subclass state (see getItems/renderRow), which is
        // not yet assigned while this base constructor runs.
    }

    /** Selects the items this section manages (e.g. rivers, roads) from the data. */
    protected abstract getItems(data: HexerData): TItem[];

    /** Creates a new item, adds it to the data, activates it and re-renders. */
    protected abstract addItem(): void;

    /** Renders a single row for the given item into the provided container. */
    protected abstract renderRow(listEl: HTMLElement, item: TItem): void;

    /** Re-renders the item list, e.g. after the active item is cleared elsewhere. */
    public refresh() {
        this.renderItems();
    }

    protected renderItems() {
        const data = this._componentOptions.getDataClone();
        this._listEl.empty();
        this.getItems(data).forEach(item => this.renderRow(this._listEl, item));
    }
}
