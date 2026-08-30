// @vitest-environment happy-dom
import ColourPalette, { ColourPaletteOptions } from "./ColourPalette";

const COLOURS = [
    '#6aa84f', '#38761d', '#b6d7a8', '#e0c56e', '#a9743f',
    '#999999', '#5a5a5a', '#3d85c6', '#9fc5e8', '#f3f6fb',
];

const build = (overrides: Partial<ColourPaletteOptions> = {}) => {
    const parent = document.createElement('div');
    const onSelect = vi.fn();
    const onOverride = vi.fn();
    new ColourPalette(parent, {
        target: 'terrain',
        colours: COLOURS,
        onSelect,
        onOverride,
        ...overrides,
    });
    return { parent, onSelect, onOverride };
};

const swatch = (parent: HTMLElement, index: number) =>
    parent.querySelector<HTMLElement>(`[data-hexer-palette-target="terrain"] [data-hexer-swatch="${index}"]`)!;

const override = (parent: HTMLElement, index: number) =>
    parent.querySelector<HTMLInputElement>(`[data-hexer-palette-target="terrain"] input[data-hexer-swatch-override="${index}"]`)!;

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
    it('updates the swatch it shows and reports the override', () => {
        // Arrange
        const { parent, onOverride } = build();
        const input = override(parent, 2);

        // Act - mirror the native picker committing a new colour.
        input.value = '#ff0000';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Assert
        expect(swatch(parent, 2).getAttribute('data-hexer-swatch-colour')).toBe('#ff0000');
        expect(onOverride).toHaveBeenCalledWith(2, '#ff0000');
    });

    it('does not fire a select when a swatch is right-clicked', () => {
        // Arrange
        const { parent, onSelect } = build();

        // Act
        const prevented = !swatch(parent, 2).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

        // Assert - the context menu is suppressed so the native picker can open.
        expect(prevented).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
    });
});
