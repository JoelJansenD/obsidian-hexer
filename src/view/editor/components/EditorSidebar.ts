import { Mountain, Shapes } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../components/ColourPalette";
import { Layer } from "../../../logic/EditorState";
import { ComponentOptions } from "../Editor";
import { HEXER_ICONS } from "../../../logic/icon";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _sidebarEl!: HTMLDivElement;

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        this._sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(this._sidebarEl);
        terrainSection.setExpanded(true);

        const iconSection = this.buildIcon(this._sidebarEl);

        this._sections.set('terrain', terrainSection);
        this._sections.set('icon', iconSection);

        const editorState = this._componentOptions.getEditorState();
        this.updateIconElements();
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
                    this.updateIconElements();
                }
            });

        const iconsContainer = iconSectionContent.createEl('div', { cls: 'hexer-sidebar-icon-container' });
        const parser = new DOMParser();
        for(let [iconName, iconPath] of HEXER_ICONS) {
            const iconEl = parser.parseFromString(iconPath, 'image/svg+xml').documentElement;
            iconEl.removeAttribute('style');

            const iconWrapper = iconsContainer.createEl('div', { cls: 'hexer-sidebar-icon-item' });
            iconWrapper.appendChild(iconEl);
            iconWrapper.addEventListener('click', () => {
                const editorState = this._componentOptions.getEditorState();
                editorState.activeIcon = {...editorState.activeIcon, name: iconName};
                this._componentOptions.setEditorState(editorState);
                this.updateIconElements();
            });
            iconWrapper.dataset.hexerIcon = iconName;
        }

        return iconSection;
    }

    private selectIcon(iconName: string, iconWrappers: Map<string, HTMLElement>) {
        const state = this._componentOptions.getEditorState();
        state.activeIcon = { name: iconName, color: state.activeIcon.color };
        this._componentOptions.setEditorState(state);

        for(const [name, wrapper] of iconWrappers) {
            wrapper.toggleClass('active', name === iconName);
        }
    }

    private updateIconElements() {
        const state = this._componentOptions.getEditorState();
        const colour = state.activeIcon.color;
        const activeIconName = state.activeIcon.name;
        
        const iconSection = this._sections.get('icon');
        if(!iconSection) return;

        const iconEls = iconSection.contentEl.querySelectorAll('.hexer-sidebar-icon-item');
        iconEls.forEach(iconEl => {
            const element = iconEl as HTMLElement;
            element.style.color = colour;
            element.toggleClass('active', element.dataset.hexerIcon === activeIconName);
        });
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