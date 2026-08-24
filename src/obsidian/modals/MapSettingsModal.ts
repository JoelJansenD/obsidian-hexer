import { App, Modal } from "obsidian";
import { MapSettings } from "../../logic/mapSettings";

export interface MapSettingsModalOptions {
    onSave?: (settings: MapSettings) => void;
}

export default class MapSettingsModal extends Modal {
    constructor(app: App) {
        super(app);
    }
}