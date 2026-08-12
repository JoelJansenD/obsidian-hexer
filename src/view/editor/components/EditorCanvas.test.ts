// @vitest-environment happy-dom
import createHexerData from "../../../__test/createHexerData";
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { RegisteredEvents, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import EditorCanvas from "./EditorCanvas";

// happy-dom has no canvas context, so keep the renderer out of the way.
vi.mock('../../render', () => ({ default: vi.fn() }));

// Each tool event handler, paired with the DOM event that has to trigger it.
// Typed as a Record over every handler name, so adding a handler to
// RegisteredEvents fails to compile until it is covered here.
const HANDLER_EVENTS: Record<keyof RegisteredEvents, MouseEventInit & { event: string }> = {
    onLeftClick: { event: 'mousedown', button: 0 },
    onRightClick: { event: 'mousedown', button: 2 },
    onLeftDoubleClick: { event: 'dblclick', button: 0 },
    onLeftDrag: { event: 'mousemove', button: 0, buttons: 1 },
};

const HANDLER_CASES = Object.entries(HANDLER_EVENTS)
    .map(([handler, { event, ...eventInit }]) => ({ handler: handler as keyof RegisteredEvents, event, eventInit }));

const createCanvas = () => {
    const componentOptions = createComponentOptions();
    const parent = document.createElement('div');
    const canvas = new EditorCanvas(parent, componentOptions);
    return { canvas, canvasEl: parent.querySelector('canvas')! };
};

const createStrategy = (events: RegisteredEvents): ToolStrategy => ({
    canBeApplied: () => true,
    getEvents: () => events,
});

describe('EditorCanvas', () => {
    describe('registerEvents', () => {
        it.each(HANDLER_CASES)('invokes $handler on $event', ({ handler, event, eventInit }) => {
            // Arrange
            const { canvas, canvasEl } = createCanvas();
            const toolEventHandler = vi.fn();
            canvas.registerEvents(createStrategy({ [handler]: toolEventHandler }));

            // Act
            canvasEl.dispatchEvent(new MouseEvent(event, { bubbles: true, cancelable: true, ...eventInit }));

            // Assert
            expect(toolEventHandler).toHaveBeenCalledOnce();
        });
    });

    describe('unregisterEvents', () => {
        it.each(HANDLER_CASES)('stops invoking $handler on $event', ({ handler, event, eventInit }) => {
            // Arrange
            const { canvas, canvasEl } = createCanvas();
            const toolEventHandler = vi.fn();
            canvas.registerEvents(createStrategy({ [handler]: toolEventHandler }));

            // Act
            canvas.unregisterEvents();
            canvasEl.dispatchEvent(new MouseEvent(event, { bubbles: true, cancelable: true, ...eventInit }));

            // Assert
            expect(toolEventHandler).not.toHaveBeenCalled();
        });
    });
});
