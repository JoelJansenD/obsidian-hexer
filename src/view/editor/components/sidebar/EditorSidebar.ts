import { Mountain, Droplets, Shapes, Route, Shield, Settings, createElement } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import ColourInput from "../../../components/ColourInput";
import ColourPalette from "../../../components/ColourPalette";
import { Layer } from "../../../../logic/EditorState";
import { ComponentOptions } from "../../Editor";
import { HEXER_ICONS } from "../../../../logic/icon";
import PathSidebarSection from "./PathSidebarSection";
import { FactionSidebarSection } from "./FactionSidebarSection";
import EditorListSidebarSection from "./EditorListSidebarSection";

export default class EditorSidebar {
    private _sections = new Map<Layer, EditorSidebarSection>();
    private _sidebarEl!: HTMLDivElement;

    constructor(private _parentEl: HTMLElement, private _componentOptions: ComponentOptions) {
        this.build();
    }

    /** Shows or hides the whole sidebar; hidden in View mode. */
    public setVisible(visible: boolean): void {
        this._sidebarEl.toggleClass('hexer-sidebar-hidden', !visible);
    }

    /**
     * Expands the given layer's section and collapses the rest, without touching
     * the editor state. Used to reflect a mode-switch reset back to the default
     * layer; ordinary layer changes go through the section headers' own clicks.
     */
    public showLayer(layer: Layer): void {
        for (const [sectionLayer, section] of this._sections) {
            section.setExpanded(sectionLayer === layer);
        }
    }

    /** Re-renders the data-driven list sections so they reflect the current map. */
    public refresh(): void {
        for (const section of this._sections.values()) {
            if (section instanceof EditorListSidebarSection) {
                section.refresh();
            }
        }
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

        const factionSection = this.buildFactions(this._sidebarEl);
        this._sections.set('faction', factionSection);

        this.buildConfigurationButton(this._sidebarEl);

        this.updateIconElements();
    }

    private buildConfigurationButton(sidebarEl: HTMLElement) {
        const buttonEl = sidebarEl.createEl('div', {
            cls: 'hexer-sidebar-config-button',
            attr: { 'data-hexer-role': 'configuration' },
        });

        const iconEl = buttonEl.createEl('div', { cls: 'hexer-sidebar-config-button-icon' });
        iconEl.appendChild(createElement(Settings, { height: 16, width: 16 }));

        buttonEl.createEl('div', { cls: 'hexer-sidebar-config-button-label', text: 'Map Settings' });

        buttonEl.addEventListener('click', () => {
            this._componentOptions.obsidian.openMapSettings({
                onSave: (settings) => {
                    const data = this._componentOptions.getDataClone();
                    data.mapSettings = settings;
                    this._componentOptions.setData(data);
                }
            });
        });

        return buttonEl;
    }

    private buildFactions(sidebarEl: HTMLElement) {
        const factionSection = new FactionSidebarSection(sidebarEl, this._componentOptions, {
            addLabel: 'New faction',
            addRole: 'add-faction',
            newItemName: 'New faction',
            label: 'Factions',
            layer: 'faction',
            icon: Shield,
            onSelect: () => this.select('faction'),
        });
        return factionSection;
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
        const iconControls = iconSectionContent.createDiv({ cls: 'hexer-colour-controls' });
        const iconColourInput = new ColourInput(
            iconControls,
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
        new ColourPalette(
            iconControls,
            {
                target: 'icon',
                colours: this._componentOptions.getDataClone().iconPalette,
                getActiveColour: () => this._componentOptions.getEditorState().activeIcon.color,
                onSelect: (colour: string) => {
                    const state = this._componentOptions.getEditorState();
                    state.activeIcon.color = colour;
                    this._componentOptions.setEditorState(state);
                    iconColourInput.setValue(colour);
                    this.updateIconElements();
                },
                onOverride: (index: number, colour: string) => {
                    const data = this._componentOptions.getDataClone();
                    data.iconPalette[index] = colour;
                    this._componentOptions.setData(data, { commitHistory: false });
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

    private buildRivers(sidebarEl: HTMLElement) {
        return new PathSidebarSection(sidebarEl, this._componentOptions, {
            icon: Droplets,
            layer: 'river',
            label: 'Rivers',
            addLabel: 'New river',
            addRole: 'add-river',
            newItemName: 'New river',
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
            newItemName: 'New road',
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
        const terrainContent = terrainSection.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        const terrainControls = terrainContent.createDiv({ cls: 'hexer-colour-controls' });
        const terrainColourInput = new ColourInput(
            terrainControls,
            {
                dataField: 'terrain',
                value: editorState.activeColour,
                onUpdate: (newColour: string) => {
                    const state = this._componentOptions.getEditorState();
                    state.activeColour = newColour;
                    this._componentOptions.setEditorState(state);
                }
            });
        new ColourPalette(
            terrainControls,
            {
                target: 'terrain',
                colours: this._componentOptions.getDataClone().terrainPalette,
                getActiveColour: () => this._componentOptions.getEditorState().activeColour,
                onSelect: (colour: string) => {
                    const state = this._componentOptions.getEditorState();
                    state.activeColour = colour;
                    this._componentOptions.setEditorState(state);
                    terrainColourInput.setValue(colour);
                },
                onOverride: (index: number, colour: string) => {
                    const data = this._componentOptions.getDataClone();
                    data.terrainPalette[index] = colour;
                    this._componentOptions.setData(data, { commitHistory: false });
                }
            });
        return terrainSection;
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
        state.activeFactionId = null;
        this._componentOptions.setEditorState(state);

        for (const section of this._sections.values()) {
            if (section instanceof EditorListSidebarSection) {
                section.refresh();
            }
        }
    }
}