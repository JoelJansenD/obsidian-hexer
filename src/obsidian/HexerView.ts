import { parseYaml, TextFileView } from 'obsidian';
import Editor from '../view/editor/Editor';
import { fromFrontmatter, HexerData, HexerFrontmatter } from '../logic/HexerData';

export const VIEW_TYPE_HEXER = 'hexer-view';

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

export class HexerView extends TextFileView {
    private editor?: Editor;
    private hexerData!: HexerData;

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

        this.hexerData = this.parseHexerData(this.data);
        this.renderEditor();
    }

    clear(): void {
        this.editor = undefined;
        this.contentEl.empty();
    }

    private renderEditor(): void {
        if (!this.editor) {
            this.contentEl.empty();
            this.editor = new Editor(this.contentEl, {
                getData: () => this.hexerData.clone(),
                setData: (data: HexerData) => this.hexerData = data
            });
        }
    }

    private parseHexerData(data: string) {
        const match = FRONTMATTER_REGEX.exec(data);
        if(!match) {
            // TODO: Display warning and go to markdown view
            throw new Error('Invalid Hexer file: Missing frontmatter');
        }

        const frontmatter = parseYaml(match[1]) as HexerFrontmatter;
        return fromFrontmatter(frontmatter);
    }

    async onClose(): Promise<void> {
        this.contentEl.empty();
    }
}
