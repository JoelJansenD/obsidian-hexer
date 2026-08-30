// @vitest-environment happy-dom
import ColourPalette, { ColourPaletteOptions } from "./ColourPalette";
import { DEFAULT_TERRAIN_PALETTE } from "../../logic/HexerData";

const COLOURS = DEFAULT_TERRAIN_PALETTE;

const build = (overrides: Partial<ColourPaletteOptions> = {}) => {
    const parent = document.createElement('div');
    const onSelect = vi.fn();
    const onOverride = vi.fn();
    const getActiveColour = vi.fn(() => '#ff0000');
    new ColourPalette(parent, {
        target: 'terrain',
        colours: COLOURS,
        onSelect,
        getActiveColour,
        onOverride,
        ...overrides,
    });
    return { parent, onSelect, onOverride, getActiveColour };
};

const swatch = (parent: HTMLElement, index: number) =>
    parent.querySelector<HTMLElement>(`[data-hexer-palette-target="terrain"] [data-hexer-swatch="${index}"]`)!;

describe('Rendering', () => {
    it('renders a swatch per colour under the layer-targeted root', () => {
        // Act
        const { parent } = build();

        // Assert
        const root = parent.querySelector('[data-hexer-palette-target="terrain"]');
        expect(root).not.toBeNull();
        const swatches = parent.querySelectorAll('[data-hexer-swatch]');
        expect(swatches.length).toBe(10);
    });

    it('carries each swatch colour lowercased in its data attribute', () => {
        // Act
        const { parent } = build({ colours: ['#6AA84F', ...COLOURS.slice(1)] });

        // Assert
        expect(swatch(parent, 0).getAttribute('data-hexer-swatch-colour')).toBe('#6aa84f');
    });
});

describe('Selecting a swatch', () => {
    it('reports the swatch colour as the new active colour on left-click', () => {
        // Arrange
        const { parent, onSelect } = build();

        // Act
        swatch(parent, 2).dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // Assert
        expect(onSelect).toHaveBeenCalledWith('#b6d7a8');
    });
});

describe('Overriding a swatch', () => {
    it('overrides a right-clicked swatch with the active colour', () => {
        // Arrange
        const { parent, onOverride } = build({ getActiveColour: () => '#FF0000' });

        // Act - right-click copies the active colour into the swatch.
        swatch(parent, 2).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

        // Assert
        expect(swatch(parent, 2).getAttribute('data-hexer-swatch-colour')).toBe('#ff0000');
        expect(onOverride).toHaveBeenCalledWith(2, '#ff0000');
    });

    it('suppresses the context menu and does not quick-switch on right-click', () => {
        // Arrange
        const { parent, onSelect } = build();

        // Act
        const prevented = !swatch(parent, 2).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

        // Assert
        expect(prevented).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
    });
});
