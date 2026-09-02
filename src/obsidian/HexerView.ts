import { Keymap, Notice, Platform, TextFileView } from 'obsidian';
import Editor, { CommitOptions } from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { EditHistory } from '../logic/EditHistory';
import { parseHexerDocument, serializeHexerDocument } from './frontmatter';
import ItemSettingsModal from './modals/ItemSettingsModal';
import { FilePreviewOptions } from '../view/ObsidianInterop';
import { PrintImage } from '../view/print';
import MapSettingsModal, { MapSettingsOptions } from './modals/MapSettingsModal';

export const VIEW_TYPE_HEXER = 'hexer-view';

// The narrow slices of Electron / Node the print flow touches. Printing loads
// the map raster into its own hidden BrowserWindow and prints that — a document
// Obsidian's own styles can't reach into and blank out — rather than the live
// app window. Declared minimally so the require() casts don't leak `any`.
interface PrintWindow {
    loadFile(path: string): Promise<void>;
    webContents: {
        print(
            options: { printBackground?: boolean; landscape?: boolean; margins?: { marginType?: string } },
            callback?: (success: boolean, failureReason: string) => void,
        ): void;
    };
    destroy(): void;
}
interface RemoteModule {
    BrowserWindow: new (options: { show?: boolean; parent?: unknown }) => PrintWindow;
    getCurrentWindow(): unknown;
}
interface NodeFs { writeFileSync(path: string, data: string, encoding: string): void; unlinkSync(path: string): void }
interface NodeOs { tmpdir(): string }
interface NodePath { join(...parts: string[]): string }

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
                    print: image => this.printDocument(image),
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
     * Prints the map raster by loading it into its own hidden Electron
     * BrowserWindow and invoking the system print dialog on that. The isolated
     * window sidesteps two dead ends on Obsidian's Electron: `window.print()`
     * routes through a print-preview shell Obsidian doesn't ship ("this app
     * doesn't support print preview"), and printing the live app window comes back
     * blank because Obsidian's own styles suppress the injected page. Loaded lazily
     * and gated on desktop, per Obsidian's guidance on Node/Electron modules.
     */
    private async printDocument({ dataUrl, landscape }: PrintImage): Promise<void> {
        if (!Platform.isDesktopApp) {
            new Notice('Printing a Hexer map is only available in the desktop app.');
            return;
        }

        let remote: RemoteModule;
        let fs: NodeFs;
        let os: NodeOs;
        let path: NodePath;
        try {
            remote = require('@electron/remote') as RemoteModule;
            fs = require('fs') as NodeFs;
            os = require('os') as NodeOs;
            path = require('path') as NodePath;
        } catch (error) {
            new Notice('Could not reach the system print dialog.');
            console.error('Hexer: failed to load the print modules', error);
            return;
        }

        // The raster is a multi-megabyte data URL, past the safe length for a
        // data: navigation, so write a one-off HTML file that shows just the image
        // and load that instead. Width-only sizing dodges the print-layout height
        // collapse; the driver's fit-to-page scales the single image onto a sheet.
        const file = path.join(os.tmpdir(), `hexer-print-${Date.now()}.html`);
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>`
            + `@page { margin: 0; } html, body { margin: 0; padding: 0; background: #ffffff; text-align: center; }`
            + `img { display: inline-block; max-width: 100%; }`
            + `</style></head><body><img alt="Map" src="${dataUrl}"></body></html>`;

        let printWindow: PrintWindow | undefined;
        try {
            fs.writeFileSync(file, html, 'utf8');
            // Parent the hidden print window to the main Obsidian window so its
            // dialog attaches to the app and surfaces in front, rather than opening
            // behind it (or appearing not to open at all).
            printWindow = new remote.BrowserWindow({ show: false, parent: remote.getCurrentWindow() });
            await printWindow.loadFile(file);
            await new Promise<void>((resolve) => {
                printWindow!.webContents.print(
                    { printBackground: true, landscape, margins: { marginType: 'none' } },
                    () => resolve(),
                );
            });
        } catch (error) {
            new Notice('Could not print the map.');
            console.error('Hexer: printing failed', error);
        } finally {
            printWindow?.destroy();
            try {
                fs.unlinkSync(file);
            } catch {
                // Best effort: a leftover temp file in the OS temp dir is harmless.
            }
        }
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
