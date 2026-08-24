import { App, Modal, Setting } from "obsidian";
import { MapSettings } from "../../logic/mapSettings";
import HexerPlugin from "../main";

export interface MapSettingsOptions {
    onSave?: (settings: MapSettings) => void;
}

export default class MapSettingsModal extends Modal {
    private readonly _settings: MapSettings;

    constructor(app: App, _initialSettings: MapSettings, private _options: MapSettingsOptions = {}) {
        super(app);
        this._settings = { ..._initialSettings };
        this.build();
    }

    private build() {
        this.setTitle('Map Settings');
        console.log(this._settings);

        new Setting(this.contentEl)
            .setName('Map Name')
            .setDesc('This does not rename the file.')
            .addText(text => text
                .setValue(this._settings.name)
                .onChange(value => {
                    this._settings.name = value.trim();
                }));

        new Setting(this.contentEl)
            .addButton(button => button
                .setButtonText('Save')
                .setCta()
                .onClick(() => {
                    if (this._options.onSave) {
                        this._options.onSave(this._settings);
                    }
                    this.close();
                }));
    }
}