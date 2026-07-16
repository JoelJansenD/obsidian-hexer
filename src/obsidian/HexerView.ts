import { TextFileView } from 'obsidian';
import Editor from '../view/editor/Editor';

export const VIEW_TYPE_HEXER = 'hexer-view';

export class HexerView extends TextFileView {
    private editor?: Editor;

    // Allow opening the view without a bound file (e.g. via the ribbon/command).
    allowNoFile = true;

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

        this.renderEditor();
    }

    clear(): void {
        this.editor = undefined;
        this.contentEl.empty();
    }

    private renderEditor(): void {
        if (!this.editor) {
            this.contentEl.empty();
            this.editor = new Editor(this.contentEl);
        }
    }

    async onClose(): Promise<void> {
        this.contentEl.empty();
    }
}
