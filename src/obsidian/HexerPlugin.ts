import { Plugin, TAbstractFile, TFile, TFolder, ViewState, WorkspaceLeaf } from 'obsidian';
import { HexerView, VIEW_TYPE_HEXER } from './HexerView';
import { initialFileContent } from '../logic/HexerData';

const HEXER_EXTENSION = '.hexer.md';

export class HexerPlugin extends Plugin {
    private openingAsMarkdown = false;
    private openingInHexer = false;

    async onload(): Promise<void> {
        this.registerView(VIEW_TYPE_HEXER, (leaf) => new HexerView(leaf));

        this.registerHoverLinkSource(VIEW_TYPE_HEXER, {
            display: 'Hexer',
            defaultMod: false,
        });

        this.addRibbonIcon('hexagon', 'Open Hexer', () => {
            void this.activateView();
        });

        this.addCommand({
            id: 'open-hexer-view',
            name: 'Open Hexer view',
            callback: () => {
                void this.activateView();
            },
        });

        // Ctrl/Cmd+E toggling lives on the view itself as a plain keydown event
        // (see HexerView), not an Obsidian command, so it stays independent of the
        // core reading-view command that owns the same combo.

        this.addCommand({
            id: 'hexer-undo',
            name: 'Undo',
            hotkeys: [{ modifiers: ['Mod'], key: 'z' }],
            checkCallback: (checking) => this.runOnActiveView(checking, (view) => view.undo()),
        });

        this.addCommand({
            id: 'hexer-redo',
            name: 'Redo',
            hotkeys: [
                { modifiers: ['Mod', 'Shift'], key: 'z' },
                { modifiers: ['Mod'], key: 'y' },
            ],
            checkCallback: (checking) => this.runOnActiveView(checking, (view) => view.redo()),
        });

        this.addCommand({
            id: 'hexer-print',
            name: 'Print map',
            checkCallback: (checking) => this.runOnActiveView(checking, (view) => view.print()),
        });

        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                if (file instanceof TFolder) {
                    menu.addItem((item) => {
                        item.setTitle('New Hexer file')
                            .setIcon('hexagon')
                            .onClick(() => { void this.createHexerFile(file); });
                    });
                }

                if (file instanceof TFile && file.path.endsWith(HEXER_EXTENSION)) {
                    menu.addItem((item) => {
                        item.setTitle('Open in Hexer')
                            .setIcon('hexagon')
                            .onClick(() => { void this.openInHexer(file); });
                    });

                    menu.addItem((item) => {
                        item.setTitle('Open as Markdown')
                            .setIcon('file-text')
                            .onClick(() => { void this.openAsMarkdown(file); });
                    });
                }
            }),
        );

        this.registerHexerViewRedirect();
    }

    /**
     * Intercepts view-state changes so that `.hexer.md` files are opened directly
     * in the Hexer view. This runs before the default markdown view is rendered,
     * avoiding the brief flash of the markdown view when opening a Hexer file.
     */
    private registerHexerViewRedirect(): void {
        const plugin = this;
        const isHexerFile = (path?: unknown): boolean =>
            typeof path === 'string' && path.endsWith(HEXER_EXTENSION);

        const original = WorkspaceLeaf.prototype.setViewState;
        WorkspaceLeaf.prototype.setViewState = function (
            this: WorkspaceLeaf,
            state: ViewState,
            eState?: unknown,
        ): Promise<void> {
            // Skip the redirect when the leaf is already showing this file as
            // markdown, so switching modes (source/reading) doesn't bounce back
            // into the Hexer view.
            const currentFile = (this.view as { file?: { path?: string } } | undefined)?.file?.path;
            const alreadyMarkdown = this.view?.getViewType() === 'markdown' && isHexerFile(currentFile);

            if (
                !plugin.openingAsMarkdown &&
                (plugin.openingInHexer || !alreadyMarkdown) &&
                state.type === 'markdown' &&
                isHexerFile(state.state?.file)
            ) {
                const hexerState: ViewState = { ...state, type: VIEW_TYPE_HEXER };
                return original.call(this, hexerState, eState);
            }
            return original.call(this, state, eState);
        };

        this.register(() => {
            WorkspaceLeaf.prototype.setViewState = original;
        });
    }

    /**
     * Runs an action against the active Hexer view, using Obsidian's checkCallback
     * protocol: when only checking, reports whether a Hexer view is active so the
     * command (and its hotkey) stays inert in other views.
     */
    private runOnActiveView(checking: boolean, action: (view: HexerView) => void): boolean {
        const view = this.app.workspace.getActiveViewOfType(HexerView);
        if (!view) {
            return false;
        }
        if (!checking) {
            action(view);
        }
        return true;
    }

    onunload(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_HEXER);
    }

    private async createHexerFile(file: TAbstractFile): Promise<void> {
        const folder = file instanceof TFolder ? file : file.parent ?? this.app.vault.getRoot();
        const now = new Date();
        const pad = (n: number): string => String(n).padStart(2, '0');
        const datetime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const path = `${folder.path}/${datetime}.hexer.md`.replace(/^\//, '');
        const newFile = await this.app.vault.create(path, initialFileContent);
        await this.app.workspace.getLeaf(false).openFile(newFile);
    }

    private async openInHexer(file: TFile): Promise<void> {
        this.openingInHexer = true;
        try {
            await this.app.workspace.getLeaf(false).openFile(file);
        } finally {
            this.openingInHexer = false;
        }
    }

    private async openAsMarkdown(file: TFile): Promise<void> {
        this.openingAsMarkdown = true;
        try {
            await this.app.workspace.getLeaf(false).openFile(file);
        } finally {
            this.openingAsMarkdown = false;
        }
    }

    private async activateView(): Promise<void> {
        const { workspace } = this.app;
        const existing = workspace.getLeavesOfType(VIEW_TYPE_HEXER)[0];
        if (existing) {
            workspace.revealLeaf(existing);
            return;
        }
        const leaf = workspace.getLeaf(false);
        await leaf.setViewState({ type: VIEW_TYPE_HEXER, active: true });
        workspace.revealLeaf(leaf);
    }
}
