import { Mountain, Shapes } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../components/ColourPalette";

export type Layer = 'terrain' | 'icon';

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _activeLayer: Layer | null = null;

    constructor(private _parentEl: HTMLElement) {
        this.build();
    }

    private build() {
        const sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(sidebarEl);

        const iconSection = new EditorSidebarSection(sidebarEl, {
            icon: Shapes,
            layer: 'icon',
            label: 'Icons',
            onSelect: () => this.select('icon'),
        });
        iconSection.contentEl.createEl('div', { text: 'Icon layers go here' });

        this._sections.set('terrain', terrainSection);
        this._sections.set('icon', iconSection);
    }

    private buildTerrain(sidebarEl: HTMLElement) {
        const terrainSection = new EditorSidebarSection(sidebarEl, {
            icon: Mountain,
            layer: 'terrain',
            label: 'Terrain',
            onSelect: () => this.select('terrain'),
        });
        
        new ColourPalette(terrainSection.contentEl);
        return terrainSection;
    }

    /** Expands the section for the given layer and collapses all others. Selecting the active layer collapses it. */
    private select(layer: Layer): void {
        this._activeLayer = this._activeLayer === layer ? null : layer;
        for (const [l, section] of this._sections) {
            section.setExpanded(l === this._activeLayer);
        }
    }
}