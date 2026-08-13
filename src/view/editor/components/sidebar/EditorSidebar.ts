import { Mountain, Droplets, Shapes, Route } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../../components/ColourPalette";
import { Layer } from "../../../../logic/EditorState";
import { ComponentOptions } from "../../Editor";
import { HEXER_ICONS } from "../../../../logic/icon";
import PathSidebarSection from "./PathSidebarSection";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _sidebarEl!: HTMLDivElement;

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        this._sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(this._sidebarEl);
        this._sections.set('terrain', terrainSection);
        terrainSection.setExpanded(true);

        const iconSection = this.buildIcon(this._sidebarEl);
        this._sections.set('icon', iconSection);

        const riverSection = this.buildRivers(this._sidebarEl);
        this._sections.set('river', riverSection);

        const roadSection = this.buildRoads(this._sidebarEl);
        this._sections.set('road', roadSection);

        this.updateIconElements();
    }

    private buildRivers(sidebarEl: HTMLElement) {
        return new PathSidebarSection(sidebarEl, this._componentOptions, {
            icon: Droplets,
            layer: 'river',
            label: 'Rivers',
            addLabel: 'New river',
            addRole: 'add-river',
            getPaths: data => data.rivers,
            onSelect: () => this.select('river'),
        });
    }

    private buildRoads(sidebarEl: HTMLElement) {
        return new PathSidebarSection(sidebarEl, this._componentOptions, {
            icon: Route,
            layer: 'road',
            label: 'Roads',
            addLabel: 'New road',
            addRole: 'add-road',
            getPaths: data => data.roads,
            onSelect: () => this.select('road'),
        });
    }

    private buildTerrain(sidebarEl: HTMLElement) {
        const terrainSection = new EditorSidebarSection(sidebarEl, {
            icon: Mountain,
            layer: 'terrain',
            label: 'Terrain',
            onSelect: () => this.select('terrain'),
        });
        
        const editorState = this._componentOptions.getEditorState();
        const paletteEl = terrainSection.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        new ColourPalette(
            paletteEl,
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

        const iconSectionContent = iconSection.contentEl.createEl('div', { cls: 'hexer-sidebar-icon hexer-sidebar-section-padded' });
        
        const editorState = this._componentOptions.getEditorState();        
        new ColourPalette(
            iconSectionContent,
            {
                dataField: 'icon',
                value: editorState.activeIcon.color,
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
        state.activePath = null;
        this._componentOptions.setEditorState(state);

        for (const section of this._sections.values()) {
            if (section instanceof PathSidebarSection) {
                section.refresh();
            }
        }
    }
}