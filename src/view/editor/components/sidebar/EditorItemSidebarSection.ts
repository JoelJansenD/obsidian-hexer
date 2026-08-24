import { HexerData } from "../../../../logic/HexerData";
import { ItemSettings } from "../../../ObsidianInterop";
import EditorListSidebarSection from "./EditorListSidebarSection";
import SidebarListRow from "./SidebarListRow";

/** The fields every editable sidebar item exposes as a coloured, named, note-linkable row. */
export interface SidebarListItem {
    id: string;
    name: string;
    color: string;
    filePath: string | null;
}

/**
 * A sidebar list whose items are editable: each row has a colour swatch, a name,
 * a settings modal, and an active/editing state tracked in the editor state. The
 * shared add/edit/close/save lifecycle lives here; subclasses only say where the
 * items live ({@link getItems}), how one is created ({@link createItem}) and found
 * ({@link findItem}), and how the active item is read and written in the editor
 * state ({@link getActiveId}/{@link setActiveId}).
 */
export default abstract class EditorItemSidebarSection<TItem extends SidebarListItem> extends EditorListSidebarSection<TItem> {
    /** Creates a new item, appends it to the data, and returns it. */
    protected abstract createItem(data: HexerData): TItem;

    /** Finds an item by id in the data, or undefined if it is gone. */
    protected abstract findItem(data: HexerData, id: string): TItem | undefined;

    /** The id of the item currently being edited, read from the editor state. */
    protected abstract getActiveId(): string | null;

    /** Records (or, with null, clears) the active item in the editor state. */
    protected abstract setActiveId(id: string | null): void;

    protected addItem(): void {
        const data = this._componentOptions.getDataClone();
        const item = this.createItem(data);
        this._componentOptions.setData(data);
        this.setActiveId(item.id);
        this.renderItems();
    }

    protected renderRow(listEl: HTMLElement, item: TItem): void {
        const activeId = this.getActiveId();
        new SidebarListRow<TItem>(listEl, {
            disableEdit: activeId !== null && activeId !== item.id,
            editMode: activeId === item.id,
            item,
            obsidian: this._componentOptions.obsidian,
            getId: current => current.id,
            getName: current => current.name,
            getColor: current => current.color,
            getFilePath: current => current.filePath,
            onEdit: id => this.edit(id),
            onFinish: () => this.close(),
            onColorPicked: color => this.saveColor(item.id, color),
            onSettings: current => this._componentOptions.obsidian.openItemSettings({
                settings: { name: current.name, filePath: current.filePath },
                onSave: settings => this.saveSettings(current.id, settings),
            }),
        });
    }

    private edit(id: string): void {
        this.setActiveId(id);
        this.renderItems();
    }

    private close(): void {
        this.setActiveId(null);
        this.renderItems();
    }

    private saveColor(id: string, color: string): void {
        const data = this._componentOptions.getDataClone();
        const item = this.findItem(data, id);
        if(!item) {
            return;
        }

        item.color = color;
        this._componentOptions.setData(data);
    }

    private saveSettings(id: string, settings: ItemSettings): void {
        const data = this._componentOptions.getDataClone();
        const item = this.findItem(data, id);
        if(!item) {
            return;
        }

        item.name = settings.name;
        item.filePath = settings.filePath;
        this._componentOptions.setData(data);
        this.renderItems();
    }
}
