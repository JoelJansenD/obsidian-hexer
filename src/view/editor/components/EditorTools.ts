export default class EditorTools {
    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const toolsEl = this._parentEl.createEl('div', { cls: 'hexer-tools' });
    }
}