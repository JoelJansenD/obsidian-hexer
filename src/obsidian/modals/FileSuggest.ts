import { AbstractInputSuggest, App, TFile } from "obsidian";

/**
 * Autocomplete over the vault's files for a text/search input. Suggestions are
 * matched by filename and carry each file's full vault-root path, so a selection
 * always stores an absolute path rather than one relative to any note.
 */
export default class FileSuggest extends AbstractInputSuggest<TFile> {

    constructor(private _app: App, inputEl: HTMLInputElement) {
        super(_app, inputEl);
    }

    protected getSuggestions(query: string): TFile[] {
        return this._app.vault.getFiles().filter(file => file.name.toLowerCase().includes(query.toLowerCase()));
    }

    renderSuggestion(value: TFile, el: HTMLElement): void {
        el.createEl('div', { text: value.name });
    }
}
