import { App, ButtonComponent, Modal, Setting, TFile } from "obsidian";
import { MapSettings } from "../../logic/mapSettings";
import { DEFAULT_NOTE_CONVENTION, resolveHexNotePath } from "../../logic/hexNote";
import { t } from "../../view/dictionary";
import FileSuggest from "./FileSuggest";

export interface MapSettingsOptions {
    onSave?: (settings: MapSettings) => void;
}

// The coordinate the note-convention preview resolves, so the user sees a
// concrete path (and its zero-padding) as they type.
const EXAMPLE_TOKENS = { col: 3, row: 5 };

export default class MapSettingsModal extends Modal {
    private readonly _settings: MapSettings;
    private _conventionExampleEl!: HTMLElement;
    private _nameValidationEl!: HTMLElement;
    private _saveButton!: ButtonComponent;

    constructor(app: App, _initialSettings: MapSettings, private _mapFilePath: string, private _options: MapSettingsOptions = {}) {
        super(app);
        this._settings = { ..._initialSettings };
        this.build();
    }

    private build() {
        this.setTitle(t('mapSettings.title'));

        new Setting(this.contentEl)
            .setName(t('mapSettings.name.label'))
            .setDesc(t('mapSettings.name.desc'))
            .addText(text => {
                text
                    .setValue(this._settings.name)
                    .onChange(value => {
                        this._settings.name = value.trim();
                        this.validateName();
                    });
                text.inputEl.dataset.hexerSetting = 'map-name';
            });

        this._nameValidationEl = this.contentEl.createEl('div', {
            cls: 'hexer-map-name-validation',
            attr: { 'data-hexer-role': 'map-name-validation' },
        });

        new Setting(this.contentEl)
            .setName(t('mapSettings.orientation.label'))
            .setDesc(t('mapSettings.orientation.desc'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption('pointy-top', t('mapSettings.orientation.pointyTop'))
                    .addOption('flat-top', t('mapSettings.orientation.flatTop'))
                    .setValue(this._settings.hexOrientation)
                    .onChange(value => {
                        this._settings.hexOrientation = value as 'pointy-top' | 'flat-top'
                    });
                dropdown.selectEl.dataset.hexerSetting = 'hex-orientation';
            });
        
        new Setting(this.contentEl)
            .setName(t('mapSettings.borders.label'))
            .setDesc(t('mapSettings.borders.desc'))
            .addToggle(toggle => toggle
                .setValue(this._settings.displayHexBorders)
                .onChange(value => this._settings.displayHexBorders = value));
        
        new Setting(this.contentEl)
            .setName(t('mapSettings.crosshair.label'))
            .setDesc(t('mapSettings.crosshair.desc'))
            .addToggle(toggle => toggle
                .setValue(this._settings.displayCrosshair)
                .onChange(value => this._settings.displayCrosshair = value));

        new Setting(this.contentEl)
            .setName(t('mapSettings.coordinates.label'))
            .setDesc(t('mapSettings.coordinates.desc'))
            .addToggle(toggle => toggle
                .setValue(this._settings.displayCoordinates)
                .onChange(value => this._settings.displayCoordinates = value));

        new Setting(this.contentEl)
            .setName(t('mapSettings.noteConvention.label'))
            .setDesc(t('mapSettings.noteConvention.desc', { default: DEFAULT_NOTE_CONVENTION }))
            .addText(text => text
                .setPlaceholder(DEFAULT_NOTE_CONVENTION)
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
            .setName(t('mapSettings.noteTemplate.label'))
            .setDesc(t('mapSettings.noteTemplate.desc'))
            .addSearch(search => {
                search
                    .setPlaceholder(t('mapSettings.noteTemplate.placeholder'))
                    .setValue(this._settings.noteTemplate)
                    .clearButtonEl.addEventListener('click', () => {
                        this._settings.noteTemplate = '';
                        search.setValue('');
                    });

                const suggest = new FileSuggest(this.app, search.inputEl);
                suggest.onSelect(file => {
                    if (file instanceof TFile) {
                        this._settings.noteTemplate = file.path;
                        search.setValue(file.path);
                    }
                    suggest.close();
                });
            });

        new Setting(this.contentEl)
            .addButton(button => button
                .setButtonText(t('mapSettings.cancel'))
                .onClick(() => {
                    this.close();
                }))
            .addButton(button => {
                this._saveButton = button;
                button
                    .setButtonText(t('mapSettings.save'))
                    .setCta()
                    .onClick(() => {
                        // Save is disabled while the name is blank; guard anyway so
                        // a nameless map can never be committed.
                        if (this._settings.name.length === 0) {
                            return;
                        }
                        if (this._options.onSave) {
                            this._options.onSave(this._settings);
                        }
                        this.close();
                    });
                button.buttonEl.dataset.role = 'save-map-settings';
            });

        // Reflect the loaded name's validity up front, so a map that somehow
        // arrives without a name shows the message and blocks Save immediately.
        this.validateName();
    }

    // A map must have a name. Shows a message and blocks Save while the name is
    // blank; clears both once a name is entered. `_settings.name` is already
    // trimmed by the field's onChange, so a whitespace-only name reads as blank.
    private validateName() {
        const valid = this._settings.name.length > 0;
        this._nameValidationEl.setText(valid ? '' : t('mapSettings.name.required'));
        this._saveButton.setDisabled(!valid);
    }

    // Reflects the typed convention as a concrete resolved path, so the user can
    // see the vault-root/relative rule and the coordinate zero-padding at a glance.
    private updateConventionExample() {
        const path = resolveHexNotePath(this._settings.noteConvention, EXAMPLE_TOKENS, this._mapFilePath);
        this._conventionExampleEl.setText(t('mapSettings.noteConvention.example', { path }));
    }
}