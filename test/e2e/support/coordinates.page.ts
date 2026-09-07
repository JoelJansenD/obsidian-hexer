// A captured canvas text draw: the label's q,r text and where it was painted.
interface LabelDraw {
    text: string;
    x: number;
    y: number;
}

// A zoom the size-50 fixture keeps its labels at (14px font clears the ~8px
// cutoff), and one it drops them at, so a scenario can straddle the threshold.
const ZOOM_ABOVE_THRESHOLD = 1;
const ZOOM_BELOW_THRESHOLD = 0.4;

/**
 * Drives and inspects the coordinate-label render pass in the running app.
 *
 * The labels are canvas text with no DOM to query, so this spies on the view's
 * real 2D context: `fillText` is the only text the renderer draws (icons use
 * `fill(Path2D)`, the crosshair `stroke`), so every captured call is a label.
 * `clearRect` runs once at the top of each frame, marking a fresh capture.
 *
 * The label toggle and zoom are set on the view's model directly rather than
 * driven through the Map Settings modal: this suite's assertion is on what the
 * renderer then paints, which is the part that belongs in e2e.
 */
class CoordinatesPage {
    /** Enables or disables coordinate labels on the open map. */
    async setDisplayCoordinates(enabled: boolean): Promise<void> {
        await browser.executeObsidian(({ app }, value) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { mapSettings?: { displayCoordinates?: boolean } };
            } | undefined;
            if (view?.hexerData?.mapSettings) {
                view.hexerData.mapSettings.displayCoordinates = value;
            }
        }, enabled);
    }

    /** Renders with labels above the on-screen size cutoff and returns their text. */
    async renderAboveThreshold(): Promise<string[]> {
        await this.setZoom(ZOOM_ABOVE_THRESHOLD);
        return this.renderedLabelTexts();
    }

    /** Renders with labels below the on-screen size cutoff and returns their text. */
    async renderBelowThreshold(): Promise<string[]> {
        await this.setZoom(ZOOM_BELOW_THRESHOLD);
        return this.renderedLabelTexts();
    }

    /** Forces a repaint and returns the sorted q,r text of every label drawn. */
    async renderedLabelTexts(): Promise<string[]> {
        await this.installSpy();
        const before = await this.renderCount();
        await this.triggerRender();
        await browser.waitUntil(async () => (await this.renderCount()) > before, {
            timeout: 2000,
            timeoutMsg: 'The canvas did not repaint after a render was requested',
        });
        const draws = await this.labelDraws();
        return draws.map(draw => draw.text).sort();
    }

    private async setZoom(zoom: number): Promise<void> {
        await browser.executeObsidian(({ app }, value) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { camera?: { zoom?: number } };
            } | undefined;
            if (view?.hexerData?.camera) {
                view.hexerData.camera.zoom = value;
            }
        }, zoom);
    }

    // Reuses the view's own redraw path (the one undo/redo triggers), so the
    // capture reflects exactly what a normal render draws.
    private async triggerRender(): Promise<void> {
        await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { editor?: { refresh: () => void } } | undefined;
            view?.editor?.refresh();
        });
    }

    // Wraps the live context's text drawing once, idempotently, to record labels.
    private async installSpy(): Promise<void> {
        await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
            const ctx = canvas?.getContext('2d') as (CanvasRenderingContext2D & {
                __hexerSpied?: boolean;
                __labelDraws?: LabelDraw[];
                __renderCount?: number;
            }) | null;
            if (!ctx || ctx.__hexerSpied) {
                return;
            }

            ctx.__hexerSpied = true;
            ctx.__labelDraws = [];
            ctx.__renderCount = 0;

            const clearRect = ctx.clearRect.bind(ctx);
            ctx.clearRect = ((x: number, y: number, w: number, h: number) => {
                // render() clears the whole backing store once at the top of a
                // frame, so start each frame's capture from empty here.
                ctx.__labelDraws = [];
                ctx.__renderCount = (ctx.__renderCount ?? 0) + 1;
                return clearRect(x, y, w, h);
            }) as typeof ctx.clearRect;

            const fillText = ctx.fillText.bind(ctx);
            ctx.fillText = ((text: string, x: number, y: number, maxWidth?: number) => {
                ctx.__labelDraws!.push({ text, x, y });
                return maxWidth === undefined ? fillText(text, x, y) : fillText(text, x, y, maxWidth);
            }) as typeof ctx.fillText;
        });
    }

    private async renderCount(): Promise<number> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
            const ctx = canvas?.getContext('2d') as (CanvasRenderingContext2D & { __renderCount?: number }) | null;
            return ctx?.__renderCount ?? 0;
        });
    }

    private async labelDraws(): Promise<LabelDraw[]> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
            const ctx = canvas?.getContext('2d') as (CanvasRenderingContext2D & { __labelDraws?: LabelDraw[] }) | null;
            return ctx?.__labelDraws ?? [];
        });
    }
}

export default new CoordinatesPage();
