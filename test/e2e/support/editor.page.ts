import type { Layer } from "../../../src/view/editor/components/EditorSidebar";
import type { PaintTool } from "../../../src/view/editor/components/EditorTools";

export async function selectLayer(layer: Layer) {
    const sectionHeader = browser.$(`[data-hexer-layer="${layer}"]`);
    sectionHeader.click();
}

export async function selectPaintTool(paintTool: PaintTool) {
    const button = browser.$(`[data-hexer-paint-tool="${paintTool}"]`);
    button.click();
}