import { Check, createElement, File, PencilLine, Settings } from "lucide";
import { ObsidianInterop } from "../../../ObsidianInterop";

export interface SidebarListRowOptions<TItem> {
    disableEdit: boolean;
    editMode: boolean;
    item: TItem;
    obsidian: ObsidianInterop;
    getId: (item: TItem) => string;
    getName: (item: TItem) => string;
    getColour: (item: TItem) => string;
    getFilePath: (item: TItem) => string | null;
    onEdit?: (itemId: string) => void;
    onFinish?: () => void;
    onColourPicked?: (colour: string) => void;
    onSettings?: (item: TItem) => void;
}

export default class SidebarListRow<TItem> {
    editButton!: HTMLDivElement;
    settingsOrViewButton?: HTMLDivElement;

    constructor(
        private _parentEl: HTMLElement,
        private _options: SidebarListRowOptions<TItem>) {
        this.render();
    }

    private render() {
        const rowEl = this._parentEl.createDiv({ cls: "hexer-sidebar-list-row" });
        rowEl.dataset.itemId = this._options.getId(this._options.item);
        rowEl.dataset.editing = String(this._options.editMode);

        const colourPicker = rowEl.createEl('input', {
            type: 'color',
            cls: 'hexer-sidebar-list-row-color',
        });
        colourPicker.value = this._options.getColour(this._options.item);
        colourPicker.disabled = !this._options.editMode;
        colourPicker.addEventListener('input', () => {
            this._options.onColourPicked?.(colourPicker.value);
        });

        rowEl.createSpan({ text: this._options.getName(this._options.item), cls: "hexer-sidebar-list-row-name" });

        if(this._options.editMode) {
            this.renderEditModeButtons(rowEl);
        }
        else {
            this.renderViewModeButtons(rowEl);
        }

        if(this._options.disableEdit) {
            this.editButton.style.display = 'none';
        }
    }

    private renderEditModeButtons(rowEl: HTMLDivElement) {
        const onSettings = this._options.onSettings;
        if(onSettings) {
            this.settingsOrViewButton = rowEl.createDiv({ cls: 'hexer-sidebar-list-row-button' });
            this.settingsOrViewButton.dataset.role = 'item-settings';
            this.settingsOrViewButton.appendChild(createElement(Settings, { width: 16, height: 16 }));
            this.settingsOrViewButton.addEventListener('click', () => {
                onSettings(this._options.item);
            });
        }

        this.editButton = rowEl.createDiv({  cls: 'hexer-sidebar-list-row-button' });
        this.editButton.dataset.role = 'save-item';
        this.editButton.appendChild(createElement(Check, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onFinish?.();
        });
    }

    private renderViewModeButtons(rowEl: HTMLDivElement) {
        const filePath = this._options.getFilePath(this._options.item);
        if(filePath) {
            const viewButton = rowEl.createDiv({ cls: 'hexer-sidebar-list-row-button' });
            this.settingsOrViewButton = viewButton;
            viewButton.dataset.role = 'view-file';
            viewButton.appendChild(createElement(File, { width: 16, height: 16 }));
            viewButton.addEventListener('mouseover', event => {
                this._options.obsidian.showFilePreview({
                    filePath,
                    event,
                    targetEl: viewButton,
                });
            });

            viewButton.addEventListener('click', event => {
                this._options.obsidian.openFile(filePath, event);
            });
        }

        this.editButton = rowEl.createDiv({  cls: 'hexer-sidebar-list-row-button' });
        this.editButton.dataset.role = 'edit-item';
        this.editButton.appendChild(createElement(PencilLine, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onEdit?.(this._options.getId(this._options.item));
        });
    }
}
