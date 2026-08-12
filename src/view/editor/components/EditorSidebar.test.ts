// @vitest-environment happy-dom
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { Layer } from "../../../logic/EditorState";
import EditorSidebar from "./EditorSidebar";

const componentOptions = createComponentOptions();
const parent = document.createElement('div');
const createSidebar = () => new EditorSidebar(parent, componentOptions);

describe('Sections', () => {
    it('switches between sections when selected', () => {
        const layers: Record<Layer, null> = {
            icon: null,
            river: null,
            road: null,
            terrain: null,
        };
        const sidebar = createSidebar();

        for (const layer of Object.keys(layers) as Layer[]) {
            const headerEl = parent.querySelector(`[data-hexer-layer="${layer}"]`);
            expect(headerEl).not.toBeNull();
            headerEl!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

            const sectionEl = headerEl!.closest('.hexer-sidebar-section');
            expect(sectionEl!.classList.contains('is-expanded')).toBe(true);
        }
    });
});