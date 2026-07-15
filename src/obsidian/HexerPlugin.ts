import { Plugin } from 'obsidian';
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
    }

    onunload(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_HEXER);
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
