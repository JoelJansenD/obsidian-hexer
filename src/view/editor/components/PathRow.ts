import { Check, createElement, Hexagon, PencilLine } from "lucide";
import { Path } from "../../../logic/path";

interface PathRowOptions {
    disableEdit: boolean;
    editMode: boolean;
    path: Path;
    onEdit?: (pathId: string) => void;
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

        rowEl.appendChild(createElement(Hexagon, { width: 36, height: 36 }));
        rowEl.createSpan({ text: this._options.path.name, cls: "hexer-path-row-name" });

        const editButton = rowEl.createDiv({  cls: 'hexer-path-row-edit-button' });

        if(this._options.disableEdit) {
            editButton.style.display = 'none';
        }
        else if(this._options.editMode) {
            editButton.dataset.role = 'save-path';
            editButton.appendChild(createElement(Check, { width: 16, height: 16 }));
            editButton.addEventListener('click', () => {
                this._options.onSave?.();
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
