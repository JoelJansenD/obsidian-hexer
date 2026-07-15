import { Mountain } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";

export default class EditorSidebar {
    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = new EditorSidebarSection(sidebarEl, { icon: Mountain, label: 'Terrain' });
    }
}