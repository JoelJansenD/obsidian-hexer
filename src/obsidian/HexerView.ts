import { ItemView, WorkspaceLeaf } from 'obsidian';
import Editor from '../view/editor/components/Editor';

export const VIEW_TYPE_HEXER = 'hexer-view';

export class HexerView extends ItemView {
    private editor?: Editor;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_HEXER;
    }

    getDisplayText(): string {
        return 'Hexer';
    }

    getIcon(): string {
        return 'hexagon';
    }

    async onOpen(): Promise<void> {
        this.contentEl.empty();

        if (!this.editor) {
            this.editor = new Editor(this.contentEl);
        }
    }

    async onClose(): Promise<void> {
        // canvas and event listeners are cleaned up by Obsidian
    }
}
