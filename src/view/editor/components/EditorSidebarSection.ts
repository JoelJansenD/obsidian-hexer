import { ChevronDown, createElement, type IconNode } from 'lucide';

interface EditorSidebarSectionOptions {
    icon?: IconNode;
    label?: string;
}

export default class EditorSidebarSection {
    constructor(private _parentEl: HTMLElement, private _options?: EditorSidebarSectionOptions) {
        this.build();
    }

    private build() {
        const sectionEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar-section' });

        const iconEl = sectionEl.createEl('div', { cls: 'hexer-sidebar-section-icon' });
        if(this._options?.icon) {
            iconEl.appendChild(createElement(this._options.icon));
        }

        const labelEl = sectionEl.createEl('div', { cls: 'hexer-sidebar-section-label' });
        if(this._options?.label) {
            labelEl.setText(this._options.label);
        }

        const chevronEl = sectionEl.createEl('div', { cls: 'hexer-sidebar-section-chevron' });
        chevronEl.appendChild(createElement(ChevronDown));
    }
}