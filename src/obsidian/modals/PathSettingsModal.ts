import { AbstractInputSuggest, App, Modal, Setting, TFile } from "obsidian";
import { PathSettingsOptions } from "../../view/ObsidianInterop";
import { Path } from "../../logic/path";

export default class PathSettingsModal extends Modal {

    private readonly path: Path;

    constructor(app: App, private _options: PathSettingsOptions) {
        super(app);

        this.path = new Path({... _options.path});

        new Setting(this.contentEl)
            .setName('Name')
            .addText(text => {
                text
                    .setValue(this.path.name)
                    .onChange(value => this.path.name = value);
                text.inputEl.dataset.hexerSetting = 'path-name';
            });

        new Setting(this.contentEl)
            .setName('File')
            .addSearch(search => {
                search
                    .setPlaceholder('Select a file to link')
                    .setValue(this.path.filePath || '')
                    .clearButtonEl.addEventListener('click', () => {
                        this.path.filePath = null;
                        search.setValue('');
                    });
                search.inputEl.dataset.hexerSetting = 'path-file';

                const suggest = new FileSuggest(this.app, search.inputEl);
                suggest.onSelect(file => {
                    if(file instanceof TFile) {
                        this.path.filePath = file.path;
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
                        this._options.onSave?.(this.path);
                        this.close();
                    });
                button.buttonEl.dataset.role = 'save-path-settings';
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