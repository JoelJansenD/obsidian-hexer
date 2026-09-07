import { Notice, Platform } from 'obsidian';
import { PrintImage } from '../view/print';
import { t } from '../view/dictionary';

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

/**
 * Prints the map raster by loading it into its own hidden Electron
 * BrowserWindow and invoking the system print dialog on that. The isolated
 * window sidesteps two dead ends on Obsidian's Electron: `window.print()`
 * routes through a print-preview shell Obsidian doesn't ship ("this app
 * doesn't support print preview"), and printing the live app window comes back
 * blank because Obsidian's own styles suppress the injected page. Loaded lazily
 * and gated on desktop, per Obsidian's guidance on Node/Electron modules.
 */
export async function printMapImage({ dataUrl, landscape }: PrintImage): Promise<void> {
    if (!Platform.isDesktopApp) {
        new Notice(t('notice.printDesktopOnly'));
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
        new Notice(t('notice.printDialogUnavailable'));
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
        new Notice(t('notice.printFailed'));
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
