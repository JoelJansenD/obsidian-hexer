import { App, Modal } from "obsidian";
import { PathSettingsOptions } from "../../view/ObsidianInterop";

export default class PathSettingsModal extends Modal {
    constructor(app: App, private _options: PathSettingsOptions) {
        super(app);
    }
}
