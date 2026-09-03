import { Keymap, Notice, TextFileView, TFile } from 'obsidian';
import Editor, { CommitOptions } from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { EditHistory } from '../logic/EditHistory';
import { parseHexerDocument, serializeHexerDocument } from './frontmatter';
import ItemSettingsModal from './modals/ItemSettingsModal';
import { FilePreviewOptions, HexNoteOptions } from '../view/ObsidianInterop';
import { printMapImage } from './print';
import MapSettingsModal, { MapSettingsOptions } from './modals/MapSettingsModal';
import { applyNoteTemplate, resolveHexNotePath } from '../logic/hexNote';
import { labelCoordinates, LabelCoordinates } from '../logic/hexagon';

export const VIEW_TYPE_HEXER = 'hexer-view';

export class HexerView extends TextFileView {
    private editor?: Editor;
    private hexerData!: HexerData;
    private history!: EditHistory;

    onload(): void {
        super.onload();

        // A self-contained Ctrl/Cmd+E toggle, registered as a plain keyboard event
        // rather than an Obsidian command — so it's independent of the core
        // reading-view command that shares the combo. Bound on the window in the
        // capture phase so it runs before Obsidian's own keymap consumes the key
        // (a document-phase listener was too late). It targets the window because
        // the canvas isn't focusable, so keys land on the body, not the view
        // element. registerDomEvent tears it down with the view.
        this.registerDomEvent(window, 'keydown', (evt) => this.onKeyDown(evt), { capture: true });
    }

    private onKeyDown(evt: KeyboardEvent): void {
        const ctrlHeld = evt.ctrlKey || evt.metaKey;
        const ePressed = evt.key.toLowerCase() === 'e';
        const noOtherModifiers = !evt.shiftKey && !evt.altKey;
        const isToggleMode = ctrlHeld && ePressed && noOtherModifiers;
        if (!isToggleMode) {
            return;
        }
        // Only the active Hexer view responds; leaves Ctrl/Cmd+E untouched in
        // markdown views and other leaves.
        if (this.app.workspace.getActiveViewOfType(HexerView) !== this) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        this.toggleMode();
    }

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

    /** Toggles the editor between View and Edit mode. Driven by the Ctrl/Cmd+E keydown. */
    toggleMode(): void {
        this.editor?.toggleMode();
    }

    /** Renders the whole map to the OS print dialog. Wired to a plugin command. */
    print(): void {
        this.editor?.print();
    }

    /**
     * Restores the previous map state, if any. Wired to a plugin command.
     * A no-op in View mode, where the map is read-only.
     */
    undo(): void {
        if (this.editor?.getMode() !== 'edit') {
            return;
        }
        const restored = this.history.undo();
        if (restored) {
            this.applyRestoredData(restored);
        }
    }

    /** Reapplies the most recently undone map state, if any. A no-op in View mode. */
    redo(): void {
        if (this.editor?.getMode() !== 'edit') {
            return;
        }
        const restored = this.history.redo();
        if (restored) {
            this.applyRestoredData(restored);
        }
    }

    private applyRestoredData(data: HexerData): void {
        // Palettes are the sole HexerData carve-out from undo (ADR-0011): a
        // snapshot restores every other field, but the live palettes ride across
        // rather than being resurrected from the snapshot.
        data.terrainPalette = this.hexerData.terrainPalette;
        data.iconPalette = this.hexerData.iconPalette;
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
                    openHexNote: options => this.openHexNote(options),
                    openMapSettings: options => this.openMapSettings(options),
                    print: image => printMapImage(image),
                });
        }
    }

    private setHexerData(data: HexerData, commit?: CommitOptions): void {
        // A camera-only move (commitHistory: false) still persists and saves, but
        // records no undo entry — panning and zooming never become undo steps.
        if (commit?.commitHistory !== false) {
            this.history.record(data, commit?.stroke);
        }
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

    /**
     * Opens the note the double-clicked hex maps to under the map's note
     * convention (or the default when none is set), creating it — seeded from
     * the note template — when it does not yet exist. See ADR 0013.
     */
    private openHexNote({ coordinate, event }: HexNoteOptions): void {
        const { noteConvention, noteTemplate, hexOrientation } = this.hexerData.mapSettings;
        const tokens = labelCoordinates(coordinate, hexOrientation);
        const notePath = resolveHexNotePath(noteConvention, tokens, this.file?.path ?? '');
        void this.openOrCreateHexNote(notePath, noteTemplate, tokens, event);
    }

    private async openOrCreateHexNote(notePath: string, templatePath: string, tokens: LabelCoordinates, event: MouseEvent): Promise<void> {
        if (!this.app.vault.getAbstractFileByPath(notePath)) {
            const content = await this.readHexNoteTemplate(templatePath, tokens);
            await this.createHexNote(notePath, content);
        }
        void this.app.workspace.openLinkText(notePath, this.file?.path ?? '', Keymap.isModEvent(event));
    }

    // Seeds a new hex note from the map's note template with the coordinate
    // tokens substituted, or an empty note when no template is set or it can't
    // be read as a file.
    private async readHexNoteTemplate(templatePath: string, tokens: LabelCoordinates): Promise<string> {
        const trimmed = (templatePath ?? '').trim();
        if (!trimmed) {
            return '';
        }
        const template = this.app.vault.getAbstractFileByPath(trimmed);
        if (!(template instanceof TFile)) {
            // The note is still created (blank); warn so a typo'd template path
            // isn't mistaken for an intentionally empty template.
            new Notice(`Hexer: note template "${trimmed}" not found; creating an empty note.`);
            return '';
        }
        return applyNoteTemplate(await this.app.vault.read(template), tokens);
    }

    // Creates the note, first materialising any missing parent folder so
    // vault.create doesn't reject a path into a folder that isn't there yet.
    private async createHexNote(notePath: string, content: string): Promise<void> {
        const slash = notePath.lastIndexOf('/');
        const folder = slash === -1 ? '' : notePath.slice(0, slash);
        if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
            // Swallow the race where a concurrent create already made the folder.
            await this.app.vault.createFolder(folder).catch(() => undefined);
        }
        await this.app.vault.create(notePath, content);
    }
    
    private openMapSettings(options: MapSettingsOptions = {}): void {
        const modal = new MapSettingsModal(this.app, this.hexerData.mapSettings, this.file?.path ?? '', options);
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
