import { Check, createElement, PencilLine } from "lucide";
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

        const editButton = rowEl.createDiv({  cls: 'hexer-path-row-edit-button' });

        if(this._options.disableEdit) {
            editButton.style.display = 'none';
        }
        else if(this._options.editMode) {
            editButton.dataset.role = 'save-path';
            editButton.appendChild(createElement(Check, { width: 16, height: 16 }));
            editButton.addEventListener('click', () => {
                this._options.onFinish?.();
            });
        }
        else {
            editButton.dataset.role = 'edit-path';
            editButton.appendChild(createElement(PencilLine, { width: 16, height: 16 }));
            editButton.addEventListener('click', () => {
                this._options.onEdit?.(this._options.path.id);
            });
        }
    }
}
