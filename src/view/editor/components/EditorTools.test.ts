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
    it.each([ 'select', 'brush', 'bucket', 'eraser', 'polygon' ])('switches to %s when the button is clicked', (tool: string) => {
        // Arrange
        const componentOptions = createComponentOptions(baseState());
        const parent = document.createElement('div');
        new EditorTools(parent, componentOptions);
        const buttonEl = button(parent, tool);

        // Act
        buttonEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // Assert
        expect(componentOptions.setEditorState).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ activePaintTool: tool }));
        expect(buttonEl.classList).toContain('active');
        const otherButtons = parent.querySelectorAll<HTMLElement>(`.hexer-tools-button:not([data-hexer-paint-tool="${tool}"])`);
        otherButtons.forEach((otherButton) => {
            expect(otherButton.classList).not.toContain('active')
        });
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
