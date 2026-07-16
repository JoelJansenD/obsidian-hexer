interface ColourPaletteOptions {
    onUpdate?: () => void;
    dataField: string;
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
                value: '#ff0000',
                attr: {
                    'data-hexer-colour-field-target': this._options?.dataField || null
                }
            });
        colourPickerEl.addEventListener('input', () => {
            this._options?.onUpdate?.();
        });
    }
}