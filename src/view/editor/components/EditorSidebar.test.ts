// @vitest-environment happy-dom
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { Layer } from "../../../logic/EditorState";
import EditorSidebar from "./EditorSidebar";

const createSidebar = () => {
    const componentOptions = createComponentOptions();
    const parent = document.createElement('div');
    new EditorSidebar(parent, componentOptions);
    return { parent, componentOptions };
};

/** Sets a colour input's value and fires the `input` event the palette listens for. */
const pickColour = (parent: HTMLElement, field: string, colour: string) => {
    const inputEl = parent.querySelector<HTMLInputElement>(`[data-hexer-colour-field-target="${field}"]`);
    expect(inputEl).not.toBeNull();
    inputEl!.value = colour;
    inputEl!.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('Sections', () => {
    it('switches between sections when selected', () => {
        const layers: Record<Layer, null> = {
            icon: null,
            river: null,
            road: null,
            terrain: null,
        };
        const { parent, componentOptions } = createSidebar();

        for (const layer of Object.keys(layers) as Layer[]) {
            const headerEl = parent.querySelector(`[data-hexer-layer="${layer}"]`);
            expect(headerEl).not.toBeNull();
            headerEl!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

            // The class lives on the section wrapper, not on the header that was clicked.
            const sectionEl = headerEl!.closest('.hexer-sidebar-section');
            expect(sectionEl!.classList.contains('is-expanded')).toBe(true);
            expect(componentOptions.setEditorState).toHaveBeenLastCalledWith(expect.objectContaining({ activeLayer: layer }));
        }
    });
});

describe('Terrain', () => {
    it('stores the picked colour as the active colour', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();

        // Act
        pickColour(parent, 'terrain', '#123456');

        // Assert
        expect(componentOptions.setEditorState).toHaveBeenCalled();
        expect(componentOptions.getEditorState().activeColour).toBe('#123456');
    });
});

describe('Icons', () => {
    it('stores the picked colour as the active icon colour', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();

        // Act
        pickColour(parent, 'icon', '#abcdef');

        // Assert
        expect(componentOptions.setEditorState).toHaveBeenCalled();
        expect(componentOptions.getEditorState().activeIcon.color).toBe('#abcdef');
        expect(componentOptions.getEditorState().activeColour).not.toBe('#abcdef');
    });

    it('switches the active icon when another icon is clicked', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();
        const previousName = componentOptions.getEditorState().activeIcon.name;
        const previousEl = parent.querySelector(`[data-hexer-icon="${previousName}"]`);
        const iconEl = parent.querySelector('[data-hexer-icon="dungeon-gate"]');
        expect(previousEl).not.toBeNull();
        expect(iconEl).not.toBeNull();

        // Act
        iconEl!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        // Assert
        expect(componentOptions.getEditorState().activeIcon.name).toBe('dungeon-gate');
        expect(iconEl!.classList.contains('active')).toBe(true);
        expect(previousEl!.classList.contains('active')).toBe(false);
    });

    it('keeps the icon colour when the icon is switched', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();
        pickColour(parent, 'icon', '#abcdef');

        // Act
        parent.querySelector('[data-hexer-icon="dungeon-gate"]')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        // Assert
        expect(componentOptions.getEditorState().activeIcon).toEqual({
            color: '#abcdef',
            name: 'dungeon-gate',
        });
    });
});
