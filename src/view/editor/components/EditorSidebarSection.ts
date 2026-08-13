import { ChevronDown, createElement, type IconNode } from 'lucide';
import { Layer } from '../../../logic/EditorState';

export interface EditorSidebarSectionOptions {
    icon?: IconNode;
    label: string;
    layer: Layer;
    onSelect?: () => void;
}

export default class EditorSidebarSection {
    private _sectionEl!: HTMLElement;
    private _contentEl!: HTMLElement;
    private _expanded = false;

    constructor(private _parentEl: HTMLElement, private _options: EditorSidebarSectionOptions) {
        this.build();
    }

    /** Container for the section's collapsible content. Append children here. */
    get contentEl(): HTMLElement {
        return this._contentEl;
    }

    /** Controls whether the section is expanded. Managed by the parent sidebar. */
    setExpanded(expanded: boolean): void {
        this._expanded = expanded;
        this._sectionEl.classList.toggle('is-expanded', expanded);
    }

    private build() {
        this._sectionEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar-section' });

        const sectionHeaderEl = this._sectionEl.createEl(
            'div',
            { 
                cls: 'hexer-sidebar-section-header',
                attr: { 
                    'data-hexer-layer': this._options.layer
                }
            });

        const iconEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-icon' });
        if(this._options.icon) {
            iconEl.appendChild(createElement(this._options.icon, { height: 16, width: 16 }));
        }

        const labelEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-label' });
        if(this._options.label) {
            labelEl.setText(this._options.label);
        }

        const chevronEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-chevron' });
        chevronEl.appendChild(createElement(ChevronDown, { height: 16, width: 16 }));

        const contentEl = this._sectionEl.createEl('div', { cls: 'hexer-sidebar-section-content' });
        this._contentEl = contentEl.createEl('div', { cls: 'hexer-sidebar-section-content-inner' });

        sectionHeaderEl.addEventListener('click', () => this._options.onSelect?.());
        this.setExpanded(this._expanded);
    }
}