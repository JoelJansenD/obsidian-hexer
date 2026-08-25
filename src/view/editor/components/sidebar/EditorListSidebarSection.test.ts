// @vitest-environment happy-dom
import { createComponentOptions } from "../../../../__test/defaultEditorState";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import EditorListSidebarSection, { EditorListSidebarSectionOptions, SidebarListItem } from "./EditorListSidebarSection";

type FakeItem = SidebarListItem;

const listOptions = (overrides: Partial<EditorListSidebarSectionOptions> = {}): EditorListSidebarSectionOptions => ({
    label: 'Fakes',
    layer: 'terrain',
    addLabel: 'New fake',
    addRole: 'add-fake',
    newItemName: 'New fake',
    ...overrides,
});

const makeItem = (id: string, name: string): FakeItem => ({ id, name, color: '#000000', filePath: null });

describe('Add button', () => {
    it('renders with the configured label and role', () => {
        // Arrange & Act
        const { parent } = createFakeSection([], { addLabel: 'New thing', addRole: 'add-thing' });

        // Assert
        expect(getAddButton(parent, 'add-thing').textContent).toContain('New thing');
    });

    it('creates and renders a new item when clicked', () => {
        // Arrange
        const { parent, componentOptions } = createFakeSection([]);

        // Act
        getAddButton(parent).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        // Assert
        expect(componentOptions.setData).toHaveBeenCalled();
        expect(readNames(parent)).toEqual(['New fake']);
    });
});

describe('Rendering items', () => {
    it('renders a row for each item, in order, without the subclass asking', () => {
        // Arrange
        const items = [
            makeItem('a', 'Alpha'),
            makeItem('b', 'Beta'),
            makeItem('c', 'Gamma'),
        ];

        // Act — the subclass never calls renderItems(); the base owns the initial render.
        const { parent } = createFakeSection(items);

        // Assert
        expect(readNames(parent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });
});

describe('Refreshing', () => {
    it('re-renders to reflect the current items', () => {
        // Arrange
        const { parent, section, items } = createFakeSection([makeItem('a', 'Alpha')]);

        // Act
        replaceItems(items, [makeItem('b', 'Beta'), makeItem('c', 'Gamma')]);
        section.refresh();

        // Assert
        expect(readNames(parent)).toEqual(['Beta', 'Gamma']);
    });

    it('renders each item once', () => {
        // Arrange
        const { parent, section } = createFakeSection([makeItem('a', 'Alpha')]);

        // Act
        section.refresh();
        section.refresh();

        // Assert
        expect(readNames(parent)).toEqual(['Alpha']);
    });
});

/**
 * A minimal concrete subclass exercising only the base class's scaffolding: the
 * add button, the guaranteed initial render, the render loop and refresh. It
 * deliberately does NOT call renderItems() in its constructor, so these tests
 * also pin the initial-render guarantee the base now owns. The active-item
 * binding is backed by an unrelated editor-state field, since the base only
 * needs some string id it can read back.
 */
class FakeListSidebarSection extends EditorListSidebarSection<FakeItem> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions,
        items: FakeItem[],
    ) {
        super(
            parentEl,
            componentOptions,
            options,
            (_data: HexerData) => items,
            name => makeItem(crypto.randomUUID(), name),
        );
    }

    protected getActiveId(): string | null {
        return this._componentOptions.getEditorState().activeFactionId;
    }

    protected setActiveId(id: string | null): void {
        const state = this._componentOptions.getEditorState();
        state.activeFactionId = id;
        this._componentOptions.setEditorState(state);
    }
}

const createFakeSection = (items: FakeItem[], options: Partial<EditorListSidebarSectionOptions> = {}) => {
    const componentOptions = createComponentOptions();
    const parent = document.createElement('div');
    const section = new FakeListSidebarSection(parent, componentOptions, listOptions(options), items);
    return { parent, componentOptions, section, items };
};

// The item accessor closes over this array, so mutate it in place to change what
// the section renders on the next refresh.
const replaceItems = (items: FakeItem[], next: FakeItem[]) => {
    items.splice(0, items.length, ...next);
};

const readNames = (parent: HTMLElement) =>
    Array.from(parent.querySelectorAll<HTMLElement>('.hexer-sidebar-list-row-name')).map(rowEl => rowEl.textContent);

const getAddButton = (parent: HTMLElement, role = 'add-fake') => {
    const buttonEl = parent.querySelector<HTMLElement>(`[data-role="${role}"]`);
    expect(buttonEl).not.toBeNull();
    return buttonEl!;
};
