import { MarkdownView, Plugin, TAbstractFile, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { HexerView, VIEW_TYPE_HEXER } from './HexerView';
import { initialFileContent } from '../logic/HexerData';

export class HexerPlugin extends Plugin {
    async onload(): Promise<void> {
        this.registerView(VIEW_TYPE_HEXER, (leaf) => new HexerView(leaf));

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

        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                menu.addItem((item) => {
                    item.setTitle('New Hexer file')
                        .setIcon('hexagon')
                        .onClick(() => { void this.createHexerFile(file); });
                });
            }),
        );

        this.registerEvent(
            this.app.workspace.on('file-open', async (file) => {
                if(!file?.path || !file.path.endsWith('.hexer.md')) return;
                // await new Promise(resolve => setTimeout(resolve, 10));
                const leaves = this.app.workspace.getLeavesOfType('markdown');
                for(const leaf of leaves) {
                    if(leaf.view.getState().file === file.path) {
                        await this.setViewState(leaf, file);
                        return;
                    }
                }
            }),
        );

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', async (leaf) => {
                if(!leaf || leaf.view.getViewType() !== 'markdown') return;
                const view = leaf.view as MarkdownView;
                if(!view.file || !view.file.path.endsWith('.hexer.md')) return;
                await this.setViewState(leaf, view.file);
            }),
        );
    }

    private async setViewState(leaf: WorkspaceLeaf, file: TFile) {
        await leaf.setViewState({ type: VIEW_TYPE_HEXER, active: true, state: { file: file.path } });
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
