interface ColourInputOptions {
    onUpdate?: (newColour: string) => void;
    dataField: string;
    value?: string;
}

/**
 * A single native `<input type="color">` for picking a layer's active colour.
 * The palette grid of quick-switch swatches is a separate component
 * ({@link ColourPalette}); selecting a swatch reflects back here via
 * {@link setValue}.
 */
export default class ColourInput {

    private _inputEl!: HTMLInputElement;

    constructor(private _parentEl: HTMLElement, private _options?: ColourInputOptions) {
        this.build();
    }

    /**
     * Shows a colour in the input without firing its `onUpdate` — used when a
     * palette swatch quick-switches the active colour, so the input reflects the
     * choice the swatch already committed.
     */
    public setValue(colour: string): void {
        this._inputEl.value = colour;
    }

    private build() {
        this._inputEl = this._parentEl.createEl(
            'input',
            {
                cls: 'hexer-colour-picker',
                type: 'color',
                value: this._options?.value || '#FF0000',
                attr: {
                    'data-hexer-colour-field-target': this._options?.dataField || null
                }
            });
        this._inputEl.addEventListener('input', () => {
            this._options?.onUpdate?.(this._inputEl.value);
        });
    }
}
