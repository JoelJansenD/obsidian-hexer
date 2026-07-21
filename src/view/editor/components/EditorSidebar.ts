import { Mountain, Shapes } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../components/ColourPalette";
import { Layer } from "../../../logic/EditorState";
import { ComponentOptions } from "../Editor";
import { HEXER_ICONS } from "../../../logic/icon";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        const sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(sidebarEl);
        terrainSection.setExpanded(true);

        const iconSection = this.buildIcon(sidebarEl);

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

    private buildIcon(sidebarEl: HTMLElement) {
        const iconSection = new EditorSidebarSection(sidebarEl, {
            icon: Shapes,
            layer: 'icon',
            label: 'Icons',
            onSelect: () => this.select('icon'),
        });

        const iconSectionContent = iconSection.contentEl.createEl('div', { cls: 'hexer-sidebar-icon' });
        
        const editorState = this._componentOptions.getEditorState();        
        new ColourPalette(
            iconSectionContent,
            {
                dataField: 'icon',
                value: editorState.activeColour,
                onUpdate: (newColour: string) => {
                    const state = this._componentOptions.getEditorState();
                    state.activeIcon.color = newColour;
                    this._componentOptions.setEditorState(state);
                }
            });

        const iconsContainer = iconSectionContent.createEl('div', { cls: 'hexer-sidebar-icon-container' });
        const parser = new DOMParser();
        for(let [iconName, iconPath] of HEXER_ICONS) {
            const iconEl = parser.parseFromString(iconPath, 'image/svg+xml').documentElement;
            iconEl.removeAttribute('style');

            const iconWrapper = iconsContainer.createEl('div', { cls: 'hexer-sidebar-icon-item' });
            iconWrapper.appendChild(iconEl);

            if(iconName === editorState.activeIcon.name) {
                iconWrapper.addClass('active');
            }
        }

        return iconSection;
    }

    private select(layer: Layer): void {
        for (const [l, section] of this._sections) {
            section.setExpanded(l === layer);
        }

        const state = this._componentOptions.getEditorState();
        state.activeLayer = layer;
        this._componentOptions.setEditorState(state);
    }
}