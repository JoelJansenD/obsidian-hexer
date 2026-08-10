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
    it.each([ 'select', 'brush', 'bucket', 'eraser', 'polygon' ])('has a button for %s', (tool: string) => {
        // Arrange
        const parent = document.createElement('div');
        new EditorTools(parent, createComponentOptions(baseState()));

        // Act
        const buttonEl = button(parent, tool);

        // Assert
        expect(buttonEl).toBeDefined();
    });

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

    it('initializes with an active select button', () => {
        // Arrange
        const parent = document.createElement('div');

        // Act
        new EditorTools(parent, createComponentOptions(baseState()));
        const selectButton = button(parent, 'select');

        // Assert
        expect(selectButton.classList.contains('active')).toBe(true);
        expect(button(parent, 'brush').classList.contains('active')).toBe(false);
        expect(button(parent, 'bucket').classList.contains('active')).toBe(false);
        expect(button(parent, 'eraser').classList.contains('active')).toBe(false);
        expect(button(parent, 'polygon').classList.contains('active')).toBe(false);
    });
});
