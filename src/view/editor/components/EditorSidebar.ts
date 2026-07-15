export default class EditorSidebar {
    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });
    }
}