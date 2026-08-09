import { parseYaml, stringifyYaml, TextFileView } from 'obsidian';
import Editor from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { FRONTMATTER_REGEX, fromFrontmatter, HexerFrontmatter, toFrontmatter } from './frontmatter';
import PathSettingsModal from './modals/PathSettingsModal';

export const VIEW_TYPE_HEXER = 'hexer-view';

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
            this.editor = new Editor(
                this.contentEl,
                {
                    getDataClone: () => this.hexerData.clone(),
                    setData: (data: HexerData) => this.setHexerData(data)
                },
                {
                    openPathSettings: options => new PathSettingsModal(this.app, options).open(),
                });
        }
    }

    private setHexerData(data: HexerData): void {
        this.hexerData = data;

        const frontmatter = stringifyYaml(toFrontmatter(data)).trim();
        const match = FRONTMATTER_REGEX.exec(this.data);
        const body = match ? this.data.slice(match[0].length) : '';
        this.data = `---\n${frontmatter}\n---${body}`;

        this.requestSave();
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
