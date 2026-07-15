import { ChevronDown, createElement, type IconNode } from 'lucide';

interface EditorSidebarSectionOptions {
    icon?: IconNode;
    label?: string;
    expanded?: boolean;
}

export default class EditorSidebarSection {
    private _sectionEl!: HTMLElement;
    private _contentEl!: HTMLElement;
    private _expanded: boolean;

    constructor(private _parentEl: HTMLElement, private _options?: EditorSidebarSectionOptions) {
        this._expanded = _options?.expanded ?? false;
        this.build();
    }

    /** Container for the section's collapsible content. Append children here. */
    get contentEl(): HTMLElement {
        return this._contentEl;
    }

    private build() {
        this._sectionEl = this._parentEl.createEl('div', { cls: 'hexer-sidebar-section' });

        const sectionHeaderEl = this._sectionEl.createEl('div', { cls: 'hexer-sidebar-section-header' });

        const iconEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-icon' });
        if(this._options?.icon) {
            iconEl.appendChild(createElement(this._options.icon));
        }

        const labelEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-label' });
        if(this._options?.label) {
            labelEl.setText(this._options.label);
        }

        const chevronEl = sectionHeaderEl.createEl('div', { cls: 'hexer-sidebar-section-chevron' });
        chevronEl.appendChild(createElement(ChevronDown));

        const contentEl = this._sectionEl.createEl('div', { cls: 'hexer-sidebar-section-content' });
        this._contentEl = contentEl.createEl('div', { cls: 'hexer-sidebar-section-content-inner' });

        sectionHeaderEl.addEventListener('click', () => this.toggle());
        this.setExpanded(this._expanded);
    }

    private toggle(): void {
        this.setExpanded(!this._expanded);
    }

    private setExpanded(expanded: boolean): void {
        this._expanded = expanded;
        this._sectionEl.classList.toggle('is-expanded', expanded);
    }
}