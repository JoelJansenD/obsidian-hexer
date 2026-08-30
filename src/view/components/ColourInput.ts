interface ColourInputOptions {
    onUpdate?: (newColour: string) => void;
    dataField: string;
    value?: string;
}

/**
 * A single native `<input type="color">` for picking a layer's active colour.
 * The palette grid of quick-switch swatches is a separate component
 * ({@link ColourPalette}).
 */
export default class ColourInput {

    constructor(private _parentEl: HTMLElement, private _options?: ColourInputOptions) {
        this.build();
    }

    private build() {
        const colourPickerEl = this._parentEl.createEl(
            'input',
            {
                cls: 'hexer-colour-picker',
                type: 'color',
                value: this._options?.value || '#FF0000',
                attr: {
                    'data-hexer-colour-field-target': this._options?.dataField || null
                }
            });
        colourPickerEl.addEventListener('input', () => {
            this._options?.onUpdate?.(colourPickerEl.value);
        });
    }
}
