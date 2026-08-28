import { mapToScreen } from "../../../src/logic/camera";
import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { Hexagon, Point, AxialCoordinates, pointToAxialCoordinates, axialCoordinatesToPoint } from "../../../src/logic/hexagon";

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

    async clickHex(coordinates: AxialCoordinates) {
        const offset = await this.hexPointerOffset(coordinates);
        console.debug('[hexer-e2e] clickHex', JSON.stringify({ coordinates, offsetFromCentre: offset }));

        // WebdriverIO pointer offsets are relative to the element's centre, which
        // is where the renderer centres hex 0,0, so hexPointerOffset already
        // yields the click point directly.
        await this.canvas.click({
            x: offset.x,
            y: offset.y,
        });

        await this.logHexerState('after clickHex');
    }

    async doubleClickHex(coordinates: AxialCoordinates) {
        const offset = await this.hexPointerOffset(coordinates);
        console.debug('[hexer-e2e] doubleClickHex', JSON.stringify({ coordinates, offsetFromCentre: offset }));

        // element.doubleClick() can't be offset, so drive two quick down/up pairs
        // at the centre-relative point via the pointer action API.
        await browser.action('pointer', { parameters: { pointerType: 'mouse' } })
            .move({ origin: this.canvas, x: offset.x, y: offset.y })
            .down({ button: 0 }).up({ button: 0 })
            .down({ button: 0 }).up({ button: 0 })
            .perform();

        await this.logHexerState('after doubleClickHex');
    }

    async rightClickHex(coordinates: AxialCoordinates) {
        const offset = await this.hexPointerOffset(coordinates);
        console.debug('[hexer-e2e] rightClickHex', JSON.stringify({ coordinates, offsetFromCentre: offset }));

        // Drive a right-button (button 2) down/up pair via the pointer action API
        // since element.click() can only issue a left click.
        await browser.action('pointer', { parameters: { pointerType: 'mouse' } })
            .move({ origin: this.canvas, x: offset.x, y: offset.y })
            .down({ button: 2 }).up({ button: 2 })
            .perform();

        await this.logHexerState('after rightClickHex');
    }

    async dragAcrossHexes(hexes: AxialCoordinates[]) {
        const points = await Promise.all(hexes.map(hex => this.hexPointerOffset(hex)));

        console.debug('[hexer-e2e] dragAcrossHexes', JSON.stringify({ hexes, offsetsFromCentre: points }));

        let builder = browser.action('pointer', { parameters: { pointerType: 'mouse' } })
            .move({ origin: this.canvas, x: points[0].x, y: points[0].y })
            .down({ button: 0 });

        for (const point of points.slice(1)) {
            builder = builder.move({ origin: this.canvas, x: point.x, y: point.y, duration: 50 });
        }

        await builder.up({ button: 0 }).perform();

        await this.logHexerState('after dragAcrossHexes');
    }

    async getHex(coordinates: AxialCoordinates): Promise<Hexagon | null> {
        const hex = await browser.executeObsidian(({ app }, coords) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { hexes?: Record<string, Hexagon> };
            } | undefined;
            return view?.hexerData?.hexes?.[`${coords.q},${coords.r}`] ?? null;
        }, coordinates);
        console.debug('[hexer-e2e] getHex', JSON.stringify({ coordinates, hex }));
        return hex;
    }

    // Dumps the full hex map so we can see exactly what was painted and where.
    async logHexerState(label: string) {
        const state = await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { size?: number; hexes?: Record<string, unknown> };
            } | undefined;
            const data = view?.hexerData;
            return {
                hasView: !!leaf,
                size: data?.size ?? null,
                hexes: data?.hexes ? Object.entries(data.hexes) : null,
            };
        });
        console.debug(`[hexer-e2e] state (${label})`, JSON.stringify(state));
    }

    // Returns the hex at the centre of the current camera view. The camera's
    // offset is the map point drawn at the viewport centre, so the hex there is
    // the one whose layout point rounds to that offset — clickable no matter how
    // the camera has moved.
    async hexInView(): Promise<AxialCoordinates> {
        const size = await this.getHexSize();
        const { offset } = await this.getCamera();
        // The e2e fixtures use flat-top maps, so name that orientation explicitly
        // rather than leaning on any implicit default.
        return pointToAxialCoordinates(offset.x, offset.y, size, 'flat-top');
    }

    // Converts a hex coordinate to a pointer offset relative to the canvas
    // centre, the origin WebdriverIO pointer actions use. The renderer draws a
    // map point p at mapToScreen(p); over a zero-sized viewport that yields the
    // centre-relative offset directly (zoom * (p - camera.offset)).
    private async hexPointerOffset(coordinates: AxialCoordinates): Promise<Point> {
        const size = await this.getHexSize();
        const camera = await this.getCamera();
        // The e2e fixtures use flat-top maps, so name that orientation explicitly
        // rather than leaning on any implicit default.
        const point = axialCoordinatesToPoint(coordinates, size, 'flat-top');
        const screen = mapToScreen(camera, 0, 0, point);
        return { x: Math.round(screen.x), y: Math.round(screen.y) };
    }

    private async getHexSize(): Promise<number> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { hexerData?: { size?: number } } | undefined;
            return view?.hexerData?.size ?? 50;
        });
    }

    private async getCamera(): Promise<{ offset: Point; zoom: number }> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { camera?: { offset?: { x: number; y: number }; zoom?: number } };
            } | undefined;
            const camera = view?.hexerData?.camera;
            return {
                offset: camera?.offset ?? { x: 0, y: 0 },
                zoom: camera?.zoom ?? 1,
            };
        });
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        // Wait for clickability, not mere existence: in headless CI the element can
        // be in the DOM but not yet interactable, so a bare waitForExist lets the
        // click race with render and silently no-op.
        await element.waitForClickable();
        await element.click();
    }
}

export default new EditorPage();
