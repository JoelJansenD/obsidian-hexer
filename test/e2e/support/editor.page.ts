import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { Hexagon, RadialCoordinates, radialCoordinatesToPoint } from "../../../src/logic/hexagon";

const TERRAIN_COLOUR_SELECTOR = '[data-hexer-colour-field-target="terrain"]';

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

export const canvas = () => browser.$('.hexer-canvas');

export async function clickHex(coordinates: RadialCoordinates) {
    const canvasEl = canvas();
    const size = await getHexSize();
    const { x, y } = radialCoordinatesToPoint(coordinates, size);
    const { width, height } = await canvasEl.getSize();

    // WebdriverIO click offsets are relative to the element's centre, whereas
    // the canvas maps clicks from its top-left corner, so re-base the point.
    await canvasEl.click({
        x: Math.round(x - width / 2),
        y: Math.round(y - height / 2),
    });
}

async function getHexSize(): Promise<number> {
    return browser.executeObsidian(({ app }) => {
        const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
        const view = leaf?.view as unknown as { hexerData?: { size?: number } } | undefined;
        return view?.hexerData?.size ?? 50;
    });
}

export async function getHex(coordinates: RadialCoordinates): Promise<Hexagon | null> {
    return browser.executeObsidian(({ app }, coords) => {
        const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
        const view = leaf?.view as unknown as {
            hexerData?: { getHex?: (q: number, r: number) => Hexagon | undefined };
        } | undefined;
        return view?.hexerData?.getHex?.(coords.q, coords.r) ?? null;
    }, coordinates);
}

export async function selectLayer(layer: Layer) {
    await selectAndClick(`[data-hexer-layer="${layer}"]`);
}

export async function selectPaintTool(paintTool: PaintTool) {
    await selectAndClick(`[data-hexer-paint-tool="${paintTool}"]`)
}

async function selectAndClick(selector: string) {
    const element = browser.$(selector);
    await element.click();
}