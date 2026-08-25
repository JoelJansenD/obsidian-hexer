import { createElement, Plus } from "lucide";
import EditorSidebarSection, { EditorSidebarSectionOptions } from "./EditorSidebarSection";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import { ItemSettings } from "../../../ObsidianInterop";
import SidebarListRow from "./SidebarListRow";

export interface EditorListSidebarSectionOptions extends EditorSidebarSectionOptions {
    /** Text shown on the add button. */
    addLabel: string;
    /** dataset.role for the add button, e.g. 'add-river'. */
    addRole: string;
    /** Name given to a newly created item, e.g. 'New river'. */
    newItemName: string;
}

/** The fields every listed item exposes to the shared row and save wiring. */
export interface SidebarListItem {
    id: string;
    name: string;
    color: string;
    filePath: string | null;
}

/**
 * A sidebar section that lists a layer's items (factions, rivers, roads, ...)
 * with an "add" button, and lets one be edited in place: rename it, recolour it
 * and link a note.
 *
 * A subclass supplies only what actually differs between layers:
 * - where the items live in the data and how a new one is made, passed to the
 *   constructor as a collection accessor and item factory;
 * - how the active item is stored in the editor state, via {@link getActiveId}
 *   and {@link setActiveId}.
 *
 * Everything else — the active-item lifecycle, saving colours and settings, and
 * wiring each row — lives here so it is written once. The initial render also
 * happens here, in the constructor, so subclasses no longer have to remember to
 * call {@link renderItems} themselves.
 */
export default abstract class EditorListSidebarSection<TItem extends SidebarListItem> extends EditorSidebarSection {
    private _listEl!: HTMLDivElement;

    constructor(
        parentEl: HTMLElement,
        protected _componentOptions: ComponentOptions,
        protected _listOptions: EditorListSidebarSectionOptions,
        private _getItems: (data: HexerData) => TItem[],
        private _createItem: (name: string) => TItem,
    ) {
        super(parentEl, _listOptions);

        const addButton = this.contentEl.createDiv({ cls: 'hexer-sidebar-add-item' });
        addButton.dataset.role = _listOptions.addRole;
        addButton.appendChild(createElement(Plus, { height: 14, width: 14 }));
        addButton.createEl('span', { text: _listOptions.addLabel });
        addButton.addEventListener('click', this.addItem.bind(this));

        this._listEl = this.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });

        // Everything the render reads — the collection accessor and the active-id
        // binding — is available by now (the accessor was passed to this
        // constructor; getActiveId reads the editor state, not subclass fields),
        // so the base owns the initial render instead of each subclass repeating
        // it at the end of its own constructor.
        this.renderItems();
    }

    /** Reads the id of the active item from the editor state, or null if none. */
    protected abstract getActiveId(): string | null;

    /** Writes the active item id (or null to clear the selection) to the state. */
    protected abstract setActiveId(id: string | null): void;

    /** Re-renders the item list, e.g. after the active item is cleared elsewhere. */
    public refresh() {
        this.renderItems();
    }

    protected renderItems() {
        const data = this._componentOptions.getDataClone();
        this._listEl.empty();
        this._getItems(data).forEach(item => this.renderRow(item));
    }

    private renderRow(item: TItem) {
        const activeId = this.getActiveId();
        new SidebarListRow<TItem>(this._listEl, {
            disableEdit: activeId !== null && activeId !== item.id,
            editMode: activeId === item.id,
            item,
            obsidian: this._componentOptions.obsidian,
            getId: i => i.id,
            getName: i => i.name,
            getColour: i => i.color,
            getFilePath: i => i.filePath,
            onEdit: this.editItem.bind(this),
            onFinish: this.closeItem.bind(this),
            onColourPicked: colour => this.saveColour(item.id, colour),
            onSettings: i => this._componentOptions.obsidian.openItemSettings({
                settings: { name: i.name, filePath: i.filePath },
                onSave: settings => this.saveSettings(i.id, settings),
            }),
        });
    }

    private addItem() {
        const data = this._componentOptions.getDataClone();
        const newItem = this._createItem(this._listOptions.newItemName);
        this._getItems(data).push(newItem);
        this._componentOptions.setData(data);
        this.setActiveId(newItem.id);
        this.renderItems();
    }

    private editItem(itemId: string) {
        this.setActiveId(itemId);
        this.renderItems();
    }

    private closeItem() {
        this.setActiveId(null);
        this.renderItems();
    }

    private saveColour(itemId: string, colour: string) {
        const data = this._componentOptions.getDataClone();
        const target = this.findItem(data, itemId);
        if(!target) {
            return;
        }

        target.color = colour;
        this._componentOptions.setData(data);
    }

    private saveSettings(itemId: string, settings: ItemSettings) {
        const data = this._componentOptions.getDataClone();
        const target = this.findItem(data, itemId);
        if(!target) {
            return;
        }

        target.name = settings.name;
        target.filePath = settings.filePath;

        this._componentOptions.setData(data);
        this.renderItems();
    }

    private findItem(data: HexerData, itemId: string): TItem | undefined {
        return this._getItems(data).find(item => item.id === itemId);
    }
}
