interface ColourPaletteOptions {
    onUpdate?: (newColour: string) => void;
    dataField: string;
    value?: string;
}

export default class ColourPalette {
    
    constructor(private _parentEl: HTMLElement, private _options?: ColourPaletteOptions) {
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