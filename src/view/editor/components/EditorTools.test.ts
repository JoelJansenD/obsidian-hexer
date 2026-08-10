// @vitest-environment happy-dom
import { EditorState } from "../../../logic/EditorState";
import { ComponentOptions } from "../Editor";
import EditorTools from "./EditorTools";

const baseState = (): EditorState => ({
    activeColour: '#FFFFFF',
    activeIcon: { color: '#FFFFFF', name: 'castle' },
    activeLayer: 'terrain',
    activePaintTool: 'select',
    activePath: null,
});

const createComponentOptions = (state: EditorState): ComponentOptions => ({
    getDataClone: vi.fn(),
    setData: vi.fn(),
    getEditorState: () => state,
    setEditorState: vi.fn((next: EditorState) => { state = next; }),
    obsidian: {} as ComponentOptions['obsidian'],
});

const button = (parent: HTMLElement, tool: string) =>
    parent.querySelector<HTMLElement>(`.hexer-tools-button[data-hexer-paint-tool="${tool}"]`)!;

describe('EditorTools', () => {
    it('marks the brush button as active when clicked', () => {
        // Arrange
        const parent = document.createElement('div');
        new EditorTools(parent, createComponentOptions(baseState()));
        const brushButton = button(parent, 'brush');

        // Act
        brushButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // Assert
        expect(brushButton.classList.contains('active')).toBe(true);
        expect(button(parent, 'select').classList.contains('active')).toBe(false);
    });
});
