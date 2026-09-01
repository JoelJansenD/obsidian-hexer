import { Keymap, Notice, Platform, TextFileView } from 'obsidian';
import Editor, { CommitOptions } from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { EditHistory } from '../logic/EditHistory';
import { parseHexerDocument, serializeHexerDocument } from './frontmatter';
import ItemSettingsModal from './modals/ItemSettingsModal';
import { FilePreviewOptions } from '../view/ObsidianInterop';
import MapSettingsModal, { MapSettingsOptions } from './modals/MapSettingsModal';

export const VIEW_TYPE_HEXER = 'hexer-view';

/** The slice of Electron's webContents the print flow uses. */
interface PrintableWebContents {
    print(
        options: { printBackground?: boolean; landscape?: boolean; margins?: { marginType?: string } },
        callback?: (success: boolean, failureReason: string) => void,
    ): void;
}

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
                    openMapSettings: options => this.openMapSettings(options),
                    print: options => this.printDocument(options)
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
    
    private openMapSettings(options: MapSettingsOptions = {}): void {
        const modal = new MapSettingsModal(this.app, this.hexerData.mapSettings, options);
        modal.open();
    }

    /**
     * Prints the current view through Electron's webContents, which opens the
     * system print dialog directly. `window.print()` can't be used: Obsidian's
     * Electron routes it through a print-preview shell it doesn't support ("this
     * app doesn't support print preview"). The view layer has already injected a
     * print-only stylesheet that reduces the printed page to just the map, so
     * printing the whole webContents still yields only the map.
     */
    private async printDocument({ landscape }: { landscape: boolean }): Promise<void> {
        if (!Platform.isDesktopApp) {
            new Notice('Printing a Hexer map is only available in the desktop app.');
            return;
        }

        let webContents: PrintableWebContents;
        try {
            // @electron/remote bridges the renderer to its own webContents, whose
            // print() opens the system dialog. Loaded lazily and gated on desktop,
            // per Obsidian's guidance on Node/Electron modules.
            const remote = require('@electron/remote') as {
                getCurrentWebContents: () => PrintableWebContents;
            };
            webContents = remote.getCurrentWebContents();
        } catch (error) {
            new Notice('Could not reach the system print dialog.');
            console.error('Hexer: failed to load @electron/remote for printing', error);
            return;
        }

        await new Promise<void>((resolve) => {
            webContents.print(
                { printBackground: true, landscape, margins: { marginType: 'none' } },
                () => resolve(),
            );
        });
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
