import { Plugin, TAbstractFile, TFolder } from 'obsidian';
import { HexerView, VIEW_TYPE_HEXER } from './HexerView';

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
        await this.app.vault.create(path, '');
        await this.activateView();
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
