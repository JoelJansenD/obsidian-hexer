import type { Layer } from "../../../src/view/editor/components/EditorSidebar";
import type { PaintTool } from "../../../src/view/editor/components/EditorTools";

export const terrainLayer = {
    colourPicker: () => browser.$(`[data-hexer-colour-field-target="terrain"]`)
};

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