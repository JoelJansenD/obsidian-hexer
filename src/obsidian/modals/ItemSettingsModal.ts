import { App, Modal, Setting, TFile } from "obsidian";
import { ItemSettings, ItemSettingsOptions } from "../../view/ObsidianInterop";
import { t } from "../../view/dictionary";
import FileSuggest from "./FileSuggest";

export default class ItemSettingsModal extends Modal {

    private readonly settings: ItemSettings;

    constructor(app: App, private _options: ItemSettingsOptions) {
        super(app);

        this.settings = { ..._options.settings };

        new Setting(this.contentEl)
            .setName(t('itemSettings.name'))
            .addText(text => {
                text
                    .setValue(this.settings.name)
                    .onChange(value => this.settings.name = value);
                text.inputEl.dataset.hexerSetting = 'item-name';
            });

        new Setting(this.contentEl)
            .setName(t('itemSettings.file'))
            .addSearch(search => {
                search
                    .setPlaceholder(t('itemSettings.filePlaceholder'))
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
                    .setButtonText(t('itemSettings.save'))
                    .setCta()
                    .onClick(() => {
                        this._options.onSave?.(this.settings);
                        this.close();
                    });
                button.buttonEl.dataset.role = 'save-item-settings';
            });
    }
}
