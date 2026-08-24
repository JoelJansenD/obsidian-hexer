import { Keymap, parseYaml, stringifyYaml, TextFileView } from 'obsidian';
import Editor from '../view/editor/Editor';
import { HexerData } from '../logic/HexerData';
import { FRONTMATTER_REGEX, fromFrontmatter, HexerFrontmatter, toFrontmatter } from './frontmatter';
import ItemSettingsModal from './modals/ItemSettingsModal';
import { FilePreviewOptions } from '../view/ObsidianInterop';

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
                    getDataClone: () => this.hexerData.clone(),
                    setData: (data: HexerData) => this.setHexerData(data)
                },
                {
                    openItemSettings: options => new ItemSettingsModal(this.app, options).open(),
                    showFilePreview: options => this.showFilePreview(options),
                    openFile: (filePath, event) => this.openFile(filePath, event),
                    openMapSettings: () => this.openMapSettings()
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

    private openFile(filePath: string, event: MouseEvent): void {
        void this.app.workspace.openLinkText(filePath, this.file?.path ?? '', Keymap.isModEvent(event));
    }
    
    private openMapSettings(): void {
        throw new Error('Method not implemented.');
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
