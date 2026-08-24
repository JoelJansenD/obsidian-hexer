interface ColorPaletteOptions {
    onUpdate?: (newColor: string) => void;
    dataField: string;
    value?: string;
}

export default class ColorPalette {
    
    constructor(private _parentEl: HTMLElement, private _options?: ColorPaletteOptions) {
        this.build();
    }

    private build() {
        const colorPickerEl = this._parentEl.createEl(
            'input',
            { 
                cls: 'hexer-color-picker',
                type: 'color',
                value: this._options?.value || '#FF0000',
                attr: {
                    'data-hexer-color-field-target': this._options?.dataField || null
                }
            });
        colorPickerEl.addEventListener('input', () => {
            this._options?.onUpdate?.(colorPickerEl.value);
        });
    }
}