// @vitest-environment happy-dom
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { HexerData } from "../../../logic/HexerData";
import { ComponentOptions } from "../Editor";
import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";

interface FakeItem {
    id: string;
    label: string;
}

const listOptions = (overrides: Partial<EditorListSidebarSectionOptions> = {}): EditorListSidebarSectionOptions => ({
    label: 'Fakes',
    layer: 'terrain',
    addLabel: 'New fake',
    addRole: 'add-fake',
    ...overrides,
});

describe('Add button', () => {
    it('renders with the configured label and role', () => {
        // Arrange & Act
        const { parent } = createFakeSection([], { addLabel: 'New thing', addRole: 'add-thing' });

        // Assert
        expect(getAddButton(parent, 'add-thing').textContent).toContain('New thing');
    });

    it('invokes addItem when clicked', () => {
        // Arrange
        const { parent, section } = createFakeSection([]);

        // Act
        getAddButton(parent).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        // Assert
        expect(section.addItemCalls).toBe(1);
    });
});

describe('Rendering items', () => {
    it('renders a row for each item, in order', () => {
        // Arrange
        const items = [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
        ];

        // Act
        const { parent } = createFakeSection(items);

        // Assert
        expect(readRows(parent)).toEqual([
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
        ]);
    });
});

describe('Refreshing', () => {
    it('re-renders to reflect the current items', () => {
        // Arrange
        const { parent, section } = createFakeSection([{ id: 'a', label: 'Alpha' }]);

        // Act
        section.setItems([
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
        ]);
        section.refresh();

        // Assert
        expect(readRows(parent)).toEqual([
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
        ]);
    });

    it('renders each item once', () => {
        // Arrange
        const { parent, section } = createFakeSection([{ id: 'a', label: 'Alpha' }]);

        // Act
        section.refresh();
        section.refresh();

        // Assert
        expect(readRows(parent)).toEqual([{ id: 'a', label: 'Alpha' }]);
    });
});

/**
 * A minimal concrete subclass exercising only the base class's list scaffolding:
 * the add button, the render loop and refresh. The item type and row markup are
 * deliberately trivial, so the tests assert base behaviour rather than any real
 * layer's rows.
 */
class FakeListSidebarSection extends EditorListSidebarSection<FakeItem> {
    public addItemCalls = 0;

    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions,
        private _items: FakeItem[],
    ) {
        super(parentEl, componentOptions, options);
        this.renderItems();
    }

    public setItems(items: FakeItem[]) {
        this._items = items;
    }

    protected getItems(_data: HexerData): FakeItem[] {
        return this._items;
    }

    protected addItem() {
        this.addItemCalls++;
    }

    protected renderRow(listEl: HTMLElement, item: FakeItem) {
        const rowEl = listEl.createDiv({ cls: 'fake-row' });
        rowEl.dataset.itemId = item.id;
        rowEl.setText(item.label);
    }
}

const createFakeSection = (items: FakeItem[], options: Partial<EditorListSidebarSectionOptions> = {}) => {
    const componentOptions = createComponentOptions();
    const parent = document.createElement('div');
    const section = new FakeListSidebarSection(parent, componentOptions, listOptions(options), items);
    return { parent, componentOptions, section };
};

const readRows = (parent: HTMLElement) =>
    Array.from(parent.querySelectorAll<HTMLElement>('.fake-row')).map(rowEl => ({
        id: rowEl.dataset.itemId,
        label: rowEl.textContent,
    }));

const getAddButton = (parent: HTMLElement, role = 'add-fake') => {
    const buttonEl = parent.querySelector<HTMLElement>(`[data-role="${role}"]`);
    expect(buttonEl).not.toBeNull();
    return buttonEl!;
};
