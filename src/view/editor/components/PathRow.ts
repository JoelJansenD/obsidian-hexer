import { Check, createElement, File, PencilLine, Settings } from "lucide";
import { Path } from "../../../logic/path";

interface PathRowOptions {
    disableEdit: boolean;
    editMode: boolean;
    path: Path;
    onEdit?: (pathId: string) => void;
    onFinish?: () => void;
    onSave?: () => void;
}

export default class PathRow {
    editButton!: HTMLDivElement;
    settingsOrViewButton!: HTMLDivElement;

    constructor(private _parentEl: HTMLElement, private _options: PathRowOptions) {
        this.render();
    }

    private render() {
        const rowEl = this._parentEl.createDiv({ cls: "hexer-path-row" });
        rowEl.dataset.pathId = this._options.path.id;
        rowEl.dataset.editing = String(this._options.editMode);
        
        const colourPicker = rowEl.createEl('input', {
            type: 'color',
            cls: 'hexer-path-row-color',
        });
        colourPicker.value = this._options.path.color;
        colourPicker.disabled = !this._options.editMode;
        colourPicker.addEventListener('input', () => {
            this._options.path.color = colourPicker.value;
            this._options.onSave?.();
        });

        rowEl.createSpan({ text: this._options.path.name, cls: "hexer-path-row-name" });


        if(this._options.disableEdit) {
            this.editButton.style.display = 'none';
        }
        else if(this._options.editMode) {
            this.renderEditModeButtons(rowEl);
        }
        else {
            this.renderViewModeButtons(rowEl);
        }
    }

    private renderEditModeButtons(rowEl: HTMLDivElement) {
        this.settingsOrViewButton = rowEl.createDiv({ cls: 'hexer-path-row-button' });
        this.settingsOrViewButton.dataset.role = 'path-settings';
        this.settingsOrViewButton.appendChild(createElement(Settings, { width: 16, height: 16 }));

        this.editButton = rowEl.createDiv({  cls: 'hexer-path-row-button' });
        this.editButton.dataset.role = 'save-path';
        this.editButton.appendChild(createElement(Check, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onFinish?.();
        });
    }

    private renderViewModeButtons(rowEl: HTMLDivElement) {
        this.settingsOrViewButton = rowEl.createDiv({ cls: 'hexer-path-row-button' });
        this.settingsOrViewButton.dataset.role = 'view-file';
        this.settingsOrViewButton.appendChild(createElement(File, { width: 16, height: 16 }));

        this.editButton = rowEl.createDiv({  cls: 'hexer-path-row-button' });
        this.editButton.dataset.role = 'edit-path';
        this.editButton.appendChild(createElement(PencilLine, { width: 16, height: 16 }));
        this.editButton.addEventListener('click', () => {
            this._options.onEdit?.(this._options.path.id);
        });
    }
}
