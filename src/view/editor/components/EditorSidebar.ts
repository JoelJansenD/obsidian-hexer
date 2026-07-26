import { Mountain, Droplets, Shapes, createElement, Plus, Route } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourPalette from "../../components/ColourPalette";
import { Layer } from "../../../logic/EditorState";
import { ComponentOptions } from "../Editor";
import { HEXER_ICONS } from "../../../logic/icon";
import PathRow from "./PathRow";
import { Path } from "../../../logic/path";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _sidebarEl!: HTMLDivElement;
    private _riverEl!: HTMLDivElement;
    private _roadEl!: HTMLDivElement;

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    private build() {
        this._sidebarEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar' });

        const terrainSection = this.buildTerrain(this._sidebarEl);
        terrainSection.setExpanded(true);

        const iconSection = this.buildIcon(this._sidebarEl);

        const riverSection = this.buildRivers(this._sidebarEl);

        const roadSection = this.buildRoads(this._sidebarEl);

        this._sections.set('terrain', terrainSection);
        this._sections.set('icon', iconSection);
        this._sections.set('river', riverSection);
        this._sections.set('road', roadSection);

        this.updateIconElements();
    }

    private buildRivers(sidebarEl: HTMLElement) {
        const riverSection = new EditorSidebarSection(sidebarEl, {
            icon: Droplets,
            layer: 'river',
            label: 'Rivers',
            onSelect: () => this.select('river'),
        });

        const addPathButton = riverSection.contentEl.createDiv({ cls: 'hexer-sidebar-add-path' });
        addPathButton.dataset.role = 'add-river';
        addPathButton.appendChild(createElement(Plus, { height: 14, width: 14 }));
        addPathButton.createEl('span', { text: 'New river' });
        addPathButton.addEventListener('click', () => {
            const data = this._componentOptions.getData();
            data.rivers.push(new Path("New river"));
            this._componentOptions.setData(data);
            this._riverEl.empty();
            data.rivers.forEach(path => {
                new PathRow(this._riverEl, path);
            });
        });

        const data = this._componentOptions.getData();
        this._riverEl = riverSection.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        data.rivers.forEach(path => {
            new PathRow(this._riverEl, path);
        });

        return riverSection;
    }

    private buildRoads(sidebarEl: HTMLElement) {
        const roadSection = new EditorSidebarSection(sidebarEl, {
            icon: Route,
            layer: 'road',
            label: 'Roads',
            onSelect: () => this.select('road'),
        });

        const addPathButton = roadSection.contentEl.createDiv({ cls: 'hexer-sidebar-add-path' });
        addPathButton.dataset.role = 'add-road';
        addPathButton.appendChild(createElement(Plus, { height: 14, width: 14 }));
        addPathButton.createEl('span', { text: 'New road' });

        addPathButton.addEventListener('click', () => {
            const data = this._componentOptions.getData();
            data.roads.push(new Path("New road"));
            this._componentOptions.setData(data);
            this._roadEl.empty();
            data.roads.forEach(path => {
                new PathRow(this._roadEl, path);
            });
        });

        const data = this._componentOptions.getData();
        this._roadEl = roadSection.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        data.roads.forEach(path => {
            new PathRow(this._roadEl, path);
        });

        return roadSection;
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
        this._componentOptions.setEditorState(state);
    }
}