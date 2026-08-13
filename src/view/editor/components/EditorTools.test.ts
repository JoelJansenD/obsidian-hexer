// @vitest-environment happy-dom
import { createComponentOptions } from "../../../__test/defaultEditorState";
import EditorTools from "./EditorTools";

const getToolButton = (parent: HTMLElement, tool: string) =>
    parent.querySelector<HTMLElement>(`.hexer-tools-button[data-hexer-paint-tool="${tool}"]`)!;

describe('EditorTools', () => {
    it.each([ 'select', 'brush', 'bucket', 'eraser', 'polygon' ])('switches to %s when the button is clicked', (tool: string) => {
        // Arrange
        const componentOptions = createComponentOptions();
        const parent = document.createElement('div');
        new EditorTools(parent, componentOptions);
        const buttonEl = getToolButton(parent, tool);

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
        new EditorTools(parent, createComponentOptions());
        const selectButton = getToolButton(parent, 'select');

        // Assert
        expect(selectButton.classList.contains('active')).toBe(true);
        expect(getToolButton(parent, 'brush').classList.contains('active')).toBe(false);
        expect(getToolButton(parent, 'bucket').classList.contains('active')).toBe(false);
        expect(getToolButton(parent, 'eraser').classList.contains('active')).toBe(false);
        expect(getToolButton(parent, 'polygon').classList.contains('active')).toBe(false);
    });
});
