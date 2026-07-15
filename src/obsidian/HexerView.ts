import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createHexState, cycle } from '../logic/RainbowHex';
import type { RainbowHexState } from '../logic/RainbowHex';
import type { Viewport } from '../rendering/Viewport';
import { renderHex } from '../rendering/renderHex';
import { paint } from '../rendering/paint';

export const VIEW_TYPE_HEXER = 'hexer-view';

export class HexerView extends ItemView {
    private state: RainbowHexState;
    private canvas!: HTMLCanvasElement;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.state = createHexState();
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

        this.canvas = this.contentEl.createEl('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.style.cursor = 'pointer';
        this.canvas.setAttribute('data-color-index', String(this.state.colorIndex));

        this.registerDomEvent(this.canvas, 'click', () => {
            this.state = cycle(this.state);
            this.canvas.setAttribute('data-color-index', String(this.state.colorIndex));
            this.draw();
        });

        this.draw();
    }

    async onClose(): Promise<void> {
        // canvas and event listeners are cleaned up by Obsidian
    }

    private draw(): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const viewport: Viewport = { width: this.canvas.width, height: this.canvas.height };
        paint(ctx, renderHex(this.state, viewport));
    }
}
