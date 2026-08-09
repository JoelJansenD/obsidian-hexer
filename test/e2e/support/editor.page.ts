import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { Hexagon, RadialCoordinates, radialCoordinatesToPoint } from "../../../src/logic/hexagon";

class EditorPage {
    get canvas() {
        return browser.$('.hexer-canvas');
    }

    async selectLayer(layer: Layer) {
        await this.selectAndClick(`[data-hexer-layer="${layer}"]`);
    }

    async selectPaintTool(paintTool: PaintTool) {
        await this.selectAndClick(`[data-hexer-paint-tool="${paintTool}"]`);
    }

    async clickHex(coordinates: RadialCoordinates) {
        const size = await this.getHexSize();
        const { x, y } = radialCoordinatesToPoint(coordinates, size);
        const { width, height } = await this.canvas.getSize();

        const offset = { x: Math.round(x - width / 2), y: Math.round(y - height / 2) };
        console.debug('[hexer-e2e] clickHex', JSON.stringify({
            coordinates, size, canvas: { width, height }, absolutePoint: { x, y }, offsetFromCentre: offset,
        }));

        // WebdriverIO click offsets are relative to the element's centre, whereas
        // the canvas maps clicks from its top-left corner, so re-base the point.
        await this.canvas.click({
            x: offset.x,
            y: offset.y,
        });

        await this.logHexerState('after clickHex');
    }

    async doubleClickHex(coordinates: RadialCoordinates) {
        const size = await this.getHexSize();
        const { x, y } = radialCoordinatesToPoint(coordinates, size);
        const { width, height } = await this.canvas.getSize();

        const offset = { x: Math.round(x - width / 2), y: Math.round(y - height / 2) };
        console.debug('[hexer-e2e] doubleClickHex', JSON.stringify({
            coordinates, size, canvas: { width, height }, absolutePoint: { x, y }, offsetFromCentre: offset,
        }));

        // element.doubleClick() can't be offset, and the canvas maps clicks from
        // its top-left corner, so drive two quick down/up pairs at the re-based
        // point via the pointer action API.
        await browser.action('pointer', { parameters: { pointerType: 'mouse' } })
            .move({ origin: this.canvas, x: offset.x, y: offset.y })
            .down({ button: 0 }).up({ button: 0 })
            .down({ button: 0 }).up({ button: 0 })
            .perform();

        await this.logHexerState('after doubleClickHex');
    }

    async dragAcrossHexes(hexes: RadialCoordinates[]) {
        const size = await this.getHexSize();
        const { width, height } = await this.canvas.getSize();

        const points = hexes.map(hex => {
            const { x, y } = radialCoordinatesToPoint(hex, size);
            return {
                x: Math.round(x - width / 2),
                y: Math.round(y - height / 2),
            };
        });

        console.debug('[hexer-e2e] dragAcrossHexes', JSON.stringify({
            hexes, size, canvas: { width, height }, offsetsFromCentre: points,
        }));

        let builder = browser.action('pointer', { parameters: { pointerType: 'mouse' } })
            .move({ origin: this.canvas, x: points[0].x, y: points[0].y })
            .down({ button: 0 });

        for (const point of points.slice(1)) {
            builder = builder.move({ origin: this.canvas, x: point.x, y: point.y, duration: 50 });
        }

        await builder.up({ button: 0 }).perform();

        await this.logHexerState('after dragAcrossHexes');
    }

    async getHex(coordinates: RadialCoordinates): Promise<Hexagon | null> {
        const hex = await browser.executeObsidian(({ app }, coords) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { getHex?: (q: number, r: number) => Hexagon | undefined };
            } | undefined;
            return view?.hexerData?.getHex?.(coords.q, coords.r) ?? null;
        }, coordinates);
        console.debug('[hexer-e2e] getHex', JSON.stringify({ coordinates, hex }));
        return hex;
    }

    // Dumps the full hex map so we can see exactly what was painted and where.
    async logHexerState(label: string) {
        const state = await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { size?: number; hexes?: Map<string, unknown> };
            } | undefined;
            const data = view?.hexerData;
            return {
                hasView: !!leaf,
                size: data?.size ?? null,
                hexes: data?.hexes ? Array.from(data.hexes.entries()) : null,
            };
        });
        console.debug(`[hexer-e2e] state (${label})`, JSON.stringify(state));
    }

    private async getHexSize(): Promise<number> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { hexerData?: { size?: number } } | undefined;
            return view?.hexerData?.size ?? 50;
        });
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        await element.waitForExist();
        await element.click();
    }
}

export default new EditorPage();
