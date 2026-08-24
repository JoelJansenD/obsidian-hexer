// @vitest-environment happy-dom
import { createComponentOptions } from "../../../../__test/defaultEditorState";
import { Layer } from "../../../../logic/EditorState";
import EditorSidebar from "./EditorSidebar";

const createSidebar = () => {
    const componentOptions = createComponentOptions();
    const parent = document.createElement('div');
    new EditorSidebar(parent, componentOptions);
    return { parent, componentOptions };
};

const getSection = (parent: HTMLElement, layer: Layer) => {
    const headerEl = parent.querySelector(`[data-hexer-layer="${layer}"]`);
    expect(headerEl).not.toBeNull();
    return headerEl!.closest('.hexer-sidebar-section')!;
};

const selectLayer = (parent: HTMLElement, layer: Layer) => {
    const headerEl = parent.querySelector(`[data-hexer-layer="${layer}"]`);
    expect(headerEl).not.toBeNull();
    headerEl!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return getSection(parent, layer);
};

const pickColor = (parent: HTMLElement, field: string, color: string) => {
    const inputEl = parent.querySelector<HTMLInputElement>(`[data-hexer-color-field-target="${field}"]`);
    expect(inputEl).not.toBeNull();
    inputEl!.value = color;
    inputEl!.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('Layers', () => {
    it('opens the terrain layer by default', () => {
        // Act
        const { parent } = createSidebar();

        // Assert
        expect(getSection(parent, 'terrain').classList.contains('is-expanded')).toBe(true);
        expect(parent.querySelectorAll('.hexer-sidebar-section.is-expanded')).toHaveLength(1);
    });

    it('switches between layers when selected', () => {
        const layers: Record<Layer, null> = {
            icon: null,
            river: null,
            road: null,
            faction: null,
            // Terrain cannot be first because it is open by default, so test it later
            terrain: null,
        };
        const { parent, componentOptions } = createSidebar();

        for (const layer of Object.keys(layers) as Layer[]) {
            const sectionEl = selectLayer(parent, layer);
            expect(sectionEl.classList.contains('is-expanded')).toBe(true);
            expect(componentOptions.setEditorState).toHaveBeenLastCalledWith(expect.objectContaining({ activeLayer: layer }));
        }
    });

    it('closes the previously selected layer', () => {
        // Arrange
        const { parent } = createSidebar();
        const iconSectionEl = selectLayer(parent, 'icon');

        // Act
        const riverSectionEl = selectLayer(parent, 'river');

        // Assert
        expect(riverSectionEl.classList.contains('is-expanded')).toBe(true);
        expect(iconSectionEl.classList.contains('is-expanded')).toBe(false);
    });
});

describe('Terrain', () => {
    it('stores the picked color as the active color', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();

        // Act
        pickColor(parent, 'terrain', '#123456');

        // Assert
        expect(componentOptions.setEditorState).toHaveBeenCalled();
        expect(componentOptions.getEditorState().activeColor).toBe('#123456');
    });
});

describe('Icons', () => {
    it('stores the picked color as the active icon color', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();

        // Act
        pickColor(parent, 'icon', '#abcdef');

        // Assert
        expect(componentOptions.setEditorState).toHaveBeenCalled();
        expect(componentOptions.getEditorState().activeIcon.color).toBe('#abcdef');
        expect(componentOptions.getEditorState().activeColor).not.toBe('#abcdef');
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

    it('keeps the icon color when the icon is switched', () => {
        // Arrange
        const { parent, componentOptions } = createSidebar();
        pickColor(parent, 'icon', '#abcdef');

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
