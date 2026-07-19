import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { RadialCoordinates, radialCoordinatesToPoint } from "../../../src/logic/hexagon";


export const terrainLayer = {
    colourPicker: () => browser.$(`[data-hexer-colour-field-target="terrain"]`)
};

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