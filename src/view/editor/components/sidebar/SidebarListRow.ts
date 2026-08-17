import { Check, createElement, File, PencilLine, Settings } from "lucide";
import { ObsidianInterop } from "../../../ObsidianInterop";
import { Path } from "../../../../logic/path";

interface SidebarListRowOptions {
    disableEdit: boolean;
    editMode: boolean;
    item: Path;
    obsidian: ObsidianInterop;
    onEdit?: (itemId: string) => void;
    onFinish?: () => void;
    onSave?: () => void;
    /** Persists the item after it has been edited in the settings dialog. */
    onSettingsSave?: (item: Path) => void;
}

export default class SidebarListRow {
    editButton!: HTMLDivElement;
    settingsOrViewButton!: HTMLDivElement;

    constructor(
        private _parentEl: HTMLElement,
        private _options: SidebarListRowOptions) {
        this.render();
    }

    private render() {
        const rowEl = this._parentEl.createDiv({ cls: "hexer-sidebar-list-row" });
        rowEl.dataset.itemId = this._options.item.id;
        rowEl.dataset.editing = String(this._options.editMode);

        const colourPicker = rowEl.createEl('input', {
            type: 'color',
            cls: 'hexer-sidebar-list-row-color',
        });
        colourPicker.value = this._options.item.color;
        colourPicker.disabled = !this._options.editMode;
        colourPicker.addEventListener('input', () => {
            this._options.item.color = colourPicker.value;
            this._options.onSave?.();
        });

        rowEl.createSpan({ text: this._options.item.name, cls: "hexer-sidebar-list-row-name" });

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
        this.settingsOrViewButton = rowEl.createDiv({ cls: 'hexer-sidebar-list-row-button' });
        this.settingsOrViewButton.dataset.role = 'item-settings';
        this.settingsOrViewButton.appendChild(createElement(Settings, { width: 16, height: 16 }));
        this.settingsOrViewButton.addEventListener('click', () => {
            this._options.obsidian.openPathSettings({
                path: this._options.item,
                onSave: edited => {
                    this._options.onSettingsSave?.(edited)
                },
            });
        });

        this.editButton = rowEl.createDiv({  cls: 'hexer-sidebar-list-row-button' });
        this.editButton.dataset.role = 'save-item';
        this.editButton.appendChild(createElement(Check, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onFinish?.();
        });
    }

    private renderViewModeButtons(rowEl: HTMLDivElement) {
        const filePath = this._options.item.filePath;
        if(filePath) {
            this.settingsOrViewButton = rowEl.createDiv({ cls: 'hexer-sidebar-list-row-button' });
            this.settingsOrViewButton.dataset.role = 'view-file';
            this.settingsOrViewButton.appendChild(createElement(File, { width: 16, height: 16 }));
            this.settingsOrViewButton.addEventListener('mouseover', event => {
                this._options.obsidian.showFilePreview({
                    filePath,
                    event,
                    targetEl: this.settingsOrViewButton,
                });
            });

            this.settingsOrViewButton.addEventListener('click', event => {
                this._options.obsidian.openFile(filePath, event);
            });
        }

        this.editButton = rowEl.createDiv({  cls: 'hexer-sidebar-list-row-button' });
        this.editButton.dataset.role = 'edit-item';
        this.editButton.appendChild(createElement(PencilLine, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onEdit?.(this._options.item.id);
        });
    }
}
