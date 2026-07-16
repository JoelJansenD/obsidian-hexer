import type { Layer } from "../../../src/view/editor/components/EditorSidebar";

export async function selectLayer(layer: Layer) {
    const sectionHeader = browser.$(`[data-hexer-layer="${layer}"]`);
    sectionHeader.click();
}