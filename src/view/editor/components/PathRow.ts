import { createElement, Hexagon, PencilLine } from "lucide";

export interface PathRowOptions {
    name: string;
}

export default class PathRow {
    constructor(private _parentEl: HTMLElement, private _options: PathRowOptions) {
        this.render();
    }

    private render() {
        const rowEl = this._parentEl.createDiv({ cls: "hexer-path-row" });
        rowEl.appendChild(createElement(Hexagon, { width: 36, height: 36 }));
        rowEl.createSpan({ text: this._options.name, cls: "hexer-path-row-name" });

        const editButton = rowEl.createDiv({  cls: 'hexer-path-row-edit-button' });
        editButton.appendChild(createElement(PencilLine, { width: 16, height: 16 }));
    }
}