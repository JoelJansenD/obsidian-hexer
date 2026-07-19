import { Mountain, Shapes } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../components/ColourPalette";
import { Layer } from "../../../logic/EditorState";
import { ComponentOptions } from "../Editor";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _activeLayer: Layer = 'terrain';

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        const sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(sidebarEl);
        terrainSection.setExpanded(true);

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
        
        const editorState = this._componentOptions.getEditorState();
        new ColourPalette(
            terrainSection.contentEl,
            {
                dataField: 'terrain',
                value: editorState.activeColour,
                onUpdate: (newColour: string) => {
                    const state = this._componentOptions.getEditorState();
                    state.activeColour = newColour;
                    this._componentOptions.setEditorState(state);
                }
            });
        return terrainSection;
    }

    private select(layer: Layer): void {
        this._activeLayer = layer;
        for (const [l, section] of this._sections) {
            section.setExpanded(l === this._activeLayer);
        }

        const state = this._componentOptions.getEditorState();
        state.activeLayer = this._activeLayer;
        this._componentOptions.setEditorState(state);
    }
}