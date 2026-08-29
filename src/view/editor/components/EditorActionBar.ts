import { createElement, Scan } from "lucide";

/** Callbacks for the global actions the bar exposes. */
export interface ActionBarOptions {
    onZoomToFit: () => void;
}

/**
 * The always-available action bar across the top of the canvas area. Unlike the
 * paint-tool cluster it is independent of the active layer or tool, and is the
 * home for global actions — currently just zoom-to-fit.
 */
export default class EditorActionBar {
    constructor(private _parentEl: HTMLElement, private _options: ActionBarOptions) {
        this.build();
    }

    private build() {
        const barEl = this._parentEl.createEl('div', { cls: 'hexer-action-bar' });

        const fitButton = barEl.createEl('div', {
            cls: 'hexer-action-bar-button',
            // Obsidian renders a hover tooltip for elements carrying an aria-label.
            attr: { 'aria-label': 'Zoom to fit' },
        });
        fitButton.appendChild(createElement(Scan, { width: 18, height: 18 }));
        fitButton.addEventListener('click', () => this._options.onZoomToFit());
    }
}
