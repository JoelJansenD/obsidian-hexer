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

        new Setting(this.contentEl)
            .setName('Map Name')
            .setDesc('This does not rename the file.')
            .addText(text => text
                .setValue(this._settings.name)
                .onChange(value => {
                    this._settings.name = value.trim();
                }));
        
        new Setting(this.contentEl)
            .setName('Hex Orientation')
            .setDesc('Select if the hexes are pointy-topped or flat-topped')
            .addDropdown(dropdown => dropdown
                .addOption('pointy-top', 'Pointy-topped')
                .addOption('flat-top', 'Flat-topped')
                .setValue(this._settings.hexOrientation)
                .onChange(value => {
                    this._settings.hexOrientation = value as 'pointy-top' | 'flat-top'
                }));
        
        new Setting(this.contentEl)
            .setName('Display borders')
            .setDesc('Display or hide the default borders between each hex')
            .addToggle(toggle => toggle
                .setValue(this._settings.displayHexBorders)
                .onChange(value => this._settings.displayHexBorders = value));
        
        new Setting(this.contentEl)
            .setName('Display crosshair')
            .setDesc('Display or hide the crosshair drawn at the center of the map')
            .addToggle(toggle => toggle
                .setValue(this._settings.displayCrosshair)
                .onChange(value => this._settings.displayCrosshair = value));

        new Setting(this.contentEl)
            .addButton(button => button
                .setButtonText('Cancel')
                .onClick(() => {
                    this.close();
                }))
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