import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { Hexagon, RadialCoordinates, radialCoordinatesToPoint } from "../../../src/logic/hexagon";

const TERRAIN_COLOUR_SELECTOR = '[data-hexer-colour-field-target="terrain"]';
const ICON_COLOUR_SELECTOR = '[data-hexer-colour-field-target="icon"]';

export const terrainLayer = {
    colourPicker: () => browser.$(TERRAIN_COLOUR_SELECTOR)
};

export async function setTerrainColour(value: string) {
    await terrainLayer.colourPicker().waitForExist();

    // A `<input type="color">` doesn't accept typed input, and setting its value
    // programmatically doesn't fire the `input` event the palette listens for,
    // so set the value and dispatch the event manually.
    await browser.execute((selector, colour) => {
        const input = document.querySelector(selector) as HTMLInputElement | null;
        if (!input) return;
        input.value = colour;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }, TERRAIN_COLOUR_SELECTOR, value);
}

export async function setIcon(icon: string) {
    const ICON_SELECTOR = `[data-hexer-icon="${icon}"]`;
    const element = await browser.$(ICON_SELECTOR);
    await element.waitForExist();
    await element.click();
}

export async function setIconColour(value: string) {
    await browser.$(ICON_COLOUR_SELECTOR).waitForExist();

    // A `<input type="color">` doesn't accept typed input, and setting its value
    // programmatically doesn't fire the `input` event the palette listens for,
    // so set the value and dispatch the event manually.
    await browser.execute((selector, colour) => {
        const input = document.querySelector(selector) as HTMLInputElement | null;
        if (!input) return;
        input.value = colour;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }, ICON_COLOUR_SELECTOR, value);
}

export const canvas = () => browser.$('.hexer-canvas');

export async function clickHex(coordinates: RadialCoordinates) {
    const canvasEl = canvas();
    const size = await getHexSize();
    const { x, y } = radialCoordinatesToPoint(coordinates, size);
    const { width, height } = await canvasEl.getSize();

    const offset = { x: Math.round(x - width / 2), y: Math.round(y - height / 2) };
    console.debug('[hexer-e2e] clickHex', JSON.stringify({
        coordinates, size, canvas: { width, height }, absolutePoint: { x, y }, offsetFromCentre: offset,
    }));

    // WebdriverIO click offsets are relative to the element's centre, whereas
    // the canvas maps clicks from its top-left corner, so re-base the point.
    await canvasEl.click({
        x: offset.x,
        y: offset.y,
    });

    await logHexerState('after clickHex');
}

async function getHexSize(): Promise<number> {
    return browser.executeObsidian(({ app }) => {
        const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
        const view = leaf?.view as unknown as { hexerData?: { size?: number } } | undefined;
        return view?.hexerData?.size ?? 50;
    });
}

export async function getHex(coordinates: RadialCoordinates): Promise<Hexagon | null> {
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
export async function logHexerState(label: string) {
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

export async function dragAcrossHexes(hexes: RadialCoordinates[]) {
    const canvasEl = canvas();
    const size = await getHexSize();
    const { width, height } = await canvasEl.getSize();

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
        .move({ origin: canvasEl, x: points[0].x, y: points[0].y })
        .down({ button: 0 });

    for (const point of points.slice(1)) {
        builder = builder.move({ origin: canvasEl, x: point.x, y: point.y, duration: 50 });
    }

    await builder.up({ button: 0 }).perform();

    await logHexerState('after dragAcrossHexes');
}

export async function selectLayer(layer: Layer) {
    await selectAndClick(`[data-hexer-layer="${layer}"]`);
}

export async function selectPaintTool(paintTool: PaintTool) {
    await selectAndClick(`[data-hexer-paint-tool="${paintTool}"]`)
}

async function selectAndClick(selector: string) {
    const element = browser.$(selector);
    await element.waitForExist();
    await element.click();
}