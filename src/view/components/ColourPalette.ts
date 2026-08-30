export interface ColourPaletteOptions {
    /** The layer the palette belongs to, e.g. "terrain" — names the DOM target. */
    target: string;
    /** The palette's current ten colours. */
    colours: string[];
    /** Left-click a swatch: quick-switch the layer's active colour to it. */
    onSelect: (colour: string) => void;
    /** Right-click a swatch: override the colour it holds in place. */
    onOverride: (index: number, colour: string) => void;
}

/**
 * The 2x5 grid of quick-switch swatches beside a layer's colour input. Each
 * swatch shows one palette colour: left-clicking makes it the active colour,
 * right-clicking opens a native picker to override it in place. The grid never
 * grows or shrinks — a palette always holds exactly its ten colours (CONTEXT.md,
 * ADR-0011). A single native colour input, distinct from this component, is
 * {@link ColourInput}.
 */
export default class ColourPalette {

    constructor(private _parentEl: HTMLElement, private _options: ColourPaletteOptions) {
        this.build();
    }

    private build() {
        const rootEl = this._parentEl.createEl('div', {
            cls: 'hexer-palette',
            attr: { 'data-hexer-palette-target': this._options.target },
        });

        this._options.colours.forEach((colour, index) => this.buildSwatch(rootEl, index, colour));
    }

    private buildSwatch(rootEl: HTMLElement, index: number, colour: string) {
        const swatchEl = rootEl.createEl('div', {
            cls: 'hexer-swatch',
            attr: {
                'data-hexer-swatch': String(index),
                'data-hexer-swatch-colour': colour.toLowerCase(),
            },
        });
        swatchEl.style.backgroundColor = colour;

        // The native picker behind the swatch. Kept visually hidden and out of the
        // hit-test (so it never intercepts the left-click), it is opened only by
        // the right-click below. See ADR-0011: overriding commits without undo.
        const overrideEl = swatchEl.createEl('input', {
            cls: 'hexer-swatch-override',
            type: 'color',
            value: colour,
            attr: { 'data-hexer-swatch-override': String(index) },
        });

        swatchEl.addEventListener('click', () => {
            this._options.onSelect(swatchEl.dataset.hexerSwatchColour!);
        });

        swatchEl.addEventListener('contextmenu', (evt) => {
            evt.preventDefault();
            // Seed the picker with the colour the swatch currently holds.
            overrideEl.value = swatchEl.dataset.hexerSwatchColour!;
            overrideEl.click();
        });

        overrideEl.addEventListener('input', () => {
            const newColour = overrideEl.value.toLowerCase();
            swatchEl.dataset.hexerSwatchColour = newColour;
            swatchEl.style.backgroundColor = newColour;
            this._options.onOverride(index, newColour);
        });
    }
}
