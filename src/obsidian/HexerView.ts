import { Keymap, TextFileView } from 'obsidian';
import Editor, { CommitOptions } from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { EditHistory } from '../logic/EditHistory';
import { parseHexerDocument, serializeHexerDocument } from './frontmatter';
import ItemSettingsModal from './modals/ItemSettingsModal';
import { FilePreviewOptions } from '../view/ObsidianInterop';
import MapSettingsModal, { MapSettingsOptions } from './modals/MapSettingsModal';

export const VIEW_TYPE_HEXER = 'hexer-view';

export class HexerView extends TextFileView {
    private editor?: Editor;
    private hexerData!: HexerData;
    private history!: EditHistory;

    getViewType(): string {
        return VIEW_TYPE_HEXER;
    }

    getDisplayText(): string {
        return this.file?.basename ?? 'Hexer';
    }

    getIcon(): string {
        return 'hexagon';
    }

    getViewData(): string {
        return this.data;
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;

        if (clear) {
            this.clear();
        }

        this.hexerData = parseHexerDocument(this.data);
        this.history = new EditHistory(this.hexerData);
        this.renderEditor();
    }

    /** Restores the previous map state, if any. Wired to a plugin command. */
    undo(): void {
        const restored = this.history.undo();
        if (restored) {
            this.applyRestoredData(restored);
        }
    }

    /** Reapplies the most recently undone map state, if any. */
    redo(): void {
        const restored = this.history.redo();
        if (restored) {
            this.applyRestoredData(restored);
        }
    }

    private applyRestoredData(data: HexerData): void {
        this.persist(data);
        this.editor?.refresh();
    }

    clear(): void {
        this.editor?.destroy();
        this.editor = undefined;
        this.contentEl.empty();
    }

    private renderEditor(): void {
        if (!this.editor) {
            this.contentEl.empty();
            this.editor = new Editor(
                this.contentEl,
                {
                    getDataClone: () => structuredClone(this.hexerData),
                    setData: (data: HexerData, commit?: CommitOptions) => this.setHexerData(data, commit)
                },
                {
                    openItemSettings: options => new ItemSettingsModal(this.app, options).open(),
                    showFilePreview: options => this.showFilePreview(options),
                    openFile: (filePath, event) => this.openFile(filePath, event),
                    openMapSettings: options => this.openMapSettings(options)
                });
        }
    }

    private setHexerData(data: HexerData, commit?: CommitOptions): void {
        this.history.record(data, commit?.stroke);
        this.persist(data);
    }

    /** Adopts a map as the current state and writes it back to the file. */
    private persist(data: HexerData): void {
        this.hexerData = data;
        this.data = serializeHexerDocument(data, this.data);
        this.requestSave();
    }

    private openFile(filePath: string, event: MouseEvent): void {
        void this.app.workspace.openLinkText(filePath, this.file?.path ?? '', Keymap.isModEvent(event));
    }
    
    private openMapSettings(options: MapSettingsOptions = {}): void {
        const modal = new MapSettingsModal(this.app, this.hexerData.mapSettings, options);
        modal.open();
    }

    private showFilePreview({ filePath, event, targetEl }: FilePreviewOptions): void {
        this.app.workspace.trigger('hover-link', {
            event,
            source: VIEW_TYPE_HEXER,
            hoverParent: this,
            targetEl,
            linktext: filePath,
            sourcePath: this.file?.path ?? '',
        });
    }

    async onClose(): Promise<void> {
        this.editor?.destroy();
        this.editor = undefined;
        this.contentEl.empty();
    }
}
