import { App, Modal, Setting } from "obsidian";
import { MapSettings } from "../../logic/mapSettings";
import { resolveHexNotePath } from "../../logic/hexNote";

export interface MapSettingsOptions {
    onSave?: (settings: MapSettings) => void;
}

// The coordinate the note-convention preview resolves, so the user sees a
// concrete path (and its zero-padding) as they type.
const EXAMPLE_TOKENS = { col: 3, row: 5 };

export default class MapSettingsModal extends Modal {
    private readonly _settings: MapSettings;
    private _conventionExampleEl!: HTMLElement;

    constructor(app: App, _initialSettings: MapSettings, private _mapFilePath: string, private _options: MapSettingsOptions = {}) {
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
            .setName('Display coordinates')
            .setDesc('Display or hide the q,r coordinate label on each non-empty hex')
            .addToggle(toggle => toggle
                .setValue(this._settings.displayCoordinates)
                .onChange(value => this._settings.displayCoordinates = value));

        new Setting(this.contentEl)
            .setName('Hex note convention')
            .setDesc('Path a hex opens on double-click in View mode. Use {{col}} and {{row}}; a leading / anchors at the vault root, otherwise it is relative to this map. Leave empty to disable.')
            .addText(text => text
                .setPlaceholder('notes/{{col}}-{{row}}')
                .setValue(this._settings.noteConvention)
                .onChange(value => {
                    this._settings.noteConvention = value;
                    this.updateConventionExample();
                }));

        this._conventionExampleEl = this.contentEl.createEl('div', {
            cls: 'hexer-note-convention-example',
            attr: { 'data-hexer-role': 'note-convention-example' },
        });
        this.updateConventionExample();

        new Setting(this.contentEl)
            .setName('Hex note template')
            .setDesc('Optional note whose contents seed a newly created hex note, with {{col}}/{{row}} substituted. Leave empty for blank notes.')
            .addText(text => text
                .setPlaceholder('templates/Hex.md')
                .setValue(this._settings.noteTemplate)
                .onChange(value => this._settings.noteTemplate = value));

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

    // Reflects the typed convention as a concrete resolved path, so the user can
    // see the vault-root/relative rule and the coordinate zero-padding at a glance.
    private updateConventionExample() {
        const path = resolveHexNotePath(this._settings.noteConvention, EXAMPLE_TOKENS, this._mapFilePath);
        this._conventionExampleEl.setText(path
            ? `Example — hex col 3, row 5 opens: ${path}`
            : 'Hex-note navigation is off until a convention is set.');
    }
}