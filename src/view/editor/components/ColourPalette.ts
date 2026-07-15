export default class ColourPalette {

    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const colourPickerEl = this._parentEl.createEl('input', { cls: 'hexer-colour-picker', type: 'color', value: '#ff0000' });
    }
}