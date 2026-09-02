import { createElement, Eye, IconNode, Pencil, Printer, Scan } from "lucide";
import { ViewMode } from "../../../logic/EditorState";

/** Callbacks for the global actions the bar exposes. */
export interface ActionBarOptions {
    onZoomToFit: () => void;
    onToggleMode: () => void;
    onPrint: () => void;
}

// The mode-toggle button advertises the mode it switches *to*: a pencil to enter
// Edit while in View, an eye to return to View while in Edit.
const TOGGLE_ICON: Record<ViewMode, IconNode> = {
    view: Pencil,
    edit: Eye,
};
const TOGGLE_LABEL: Record<ViewMode, string> = {
    view: 'Edit',
    edit: 'View',
};

/**
 * The always-available action bar across the top of the canvas area. Unlike the
 * paint-tool cluster it is independent of the active layer or tool and shows in
 * both modes, holding the global actions — the mode toggle and zoom-to-fit.
 */
export default class EditorActionBar {
    private _toggleButton!: HTMLElement;

    constructor(private _parentEl: HTMLElement, private _options: ActionBarOptions) {
        this.build();
    }

    /** Reflects the current mode on the toggle button's icon and tooltip. */
    public setMode(mode: ViewMode) {
        this._toggleButton.empty();
        this._toggleButton.appendChild(createElement(TOGGLE_ICON[mode], { width: 18, height: 18 }));
        this._toggleButton.setAttribute('aria-label', TOGGLE_LABEL[mode]);
    }

    private build() {
        const barEl = this._parentEl.createEl('div', { cls: 'hexer-action-bar' });

        this._toggleButton = barEl.createEl('div', {
            cls: 'hexer-action-bar-button',
            attr: { 'data-hexer-action': 'toggle-mode' },
        });
        this._toggleButton.addEventListener('click', () => this._options.onToggleMode());
        // Populate the icon/label; the real mode is synced in by setMode.
        this.setMode('view');

        const fitButton = barEl.createEl('div', {
            cls: 'hexer-action-bar-button',
            // Obsidian renders a hover tooltip for elements carrying an aria-label.
            attr: { 'aria-label': 'Zoom to fit' },
        });
        fitButton.appendChild(createElement(Scan, { width: 18, height: 18 }));
        fitButton.addEventListener('click', () => this._options.onZoomToFit());

        // Printing is read-only, so it sits alongside the other global actions and
        // shows in both View and Edit mode.
        const printButton = barEl.createEl('div', {
            cls: 'hexer-action-bar-button',
            attr: { 'aria-label': 'Print' },
        });
        printButton.appendChild(createElement(Printer, { width: 18, height: 18 }));
        printButton.addEventListener('click', () => this._options.onPrint());
    }
}
