export interface ColourPaletteOptions {
    /** The layer the palette belongs to, e.g. "terrain" — names the DOM target. */
    target: string;
    /** The palette's current ten colours. */
    colours: string[];
    /** Left-click a swatch: quick-switch the layer's active colour to it. */
    onSelect: (colour: string) => void;
    /** The layer's current active colour, read when a swatch is overridden. */
    getActiveColour: () => string;
    /** Right-click a swatch: override the colour it holds with the active colour. */
    onOverride: (index: number, colour: string) => void;
}

/**
 * The 2x5 grid of quick-switch swatches beside a layer's colour input. Each
 * swatch shows one palette colour: left-clicking makes it the active colour,
 * right-clicking overrides it in place with the current active colour. The grid
 * never grows or shrinks — a palette always holds exactly its ten colours
 * (CONTEXT.md, ADR-0011). A single native colour input, distinct from this
 * component, is {@link ColourInput}.
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

        swatchEl.addEventListener('click', () => {
            this._options.onSelect(swatchEl.dataset.hexerSwatchColour!);
        });

        // Right-click overrides the swatch with the active colour rather than
        // opening a picker; suppress the context menu so the copy is the only
        // effect. Overriding commits without undo — see ADR-0011.
        swatchEl.addEventListener('contextmenu', (evt) => {
            evt.preventDefault();
            const newColour = this._options.getActiveColour().toLowerCase();
            swatchEl.dataset.hexerSwatchColour = newColour;
            swatchEl.style.backgroundColor = newColour;
            this._options.onOverride(index, newColour);
        });
    }
}
