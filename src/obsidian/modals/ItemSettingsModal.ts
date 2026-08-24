import { AbstractInputSuggest, App, Modal, Setting, TFile } from "obsidian";
import { ItemSettings, ItemSettingsOptions } from "../../view/ObsidianInterop";

export default class ItemSettingsModal extends Modal {

    private readonly settings: ItemSettings;

    constructor(app: App, private _options: ItemSettingsOptions = {}) {
        super(app);

        this.settings = { ..._options.settings };

        new Setting(this.contentEl)
            .setName('Name')
            .addText(text => {
                text
                    .setValue(this.settings.name)
                    .onChange(value => this.settings.name = value);
                text.inputEl.dataset.hexerSetting = 'item-name';
            });

        new Setting(this.contentEl)
            .setName('File')
            .addSearch(search => {
                search
                    .setPlaceholder('Select a file to link')
                    .setValue(this.settings.filePath || '')
                    .clearButtonEl.addEventListener('click', () => {
                        this.settings.filePath = null;
                        search.setValue('');
                    });
                search.inputEl.dataset.hexerSetting = 'item-file';

                const suggest = new FileSuggest(this.app, search.inputEl);
                suggest.onSelect(file => {
                    if(file instanceof TFile) {
                        this.settings.filePath = file.path;
                        search.setValue(file.path);
                    }
                    suggest.close();
                });
            });

        new Setting(this.contentEl)
            .addButton(button => {
                button
                    .setButtonText('Save')
                    .setCta()
                    .onClick(() => {
                        this._options.onSave?.(this.settings);
                        this.close();
                    });
                button.buttonEl.dataset.role = 'save-item-settings';
            });
    }
}

class FileSuggest extends AbstractInputSuggest<TFile> {

    constructor(private _app: App, inputEl: HTMLInputElement) {
        super(_app, inputEl);
    }

    protected getSuggestions(query: string): TFile[] | Promise<TFile[]> {
        return this._app.vault.getFiles().filter(file => file.name.toLowerCase().includes(query.toLowerCase()));
    }

    renderSuggestion(value: TFile, el: HTMLElement): void {
        el.createEl('div', { text: value.name });
    }
}
