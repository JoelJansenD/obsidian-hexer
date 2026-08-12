// @vitest-environment happy-dom
import createHexerData from "../../../__test/createHexerData";
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { RegisteredEvents, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import EditorCanvas from "./EditorCanvas";
import render from "../../render";

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

// happy-dom performs no layout, so clientWidth/clientHeight are always 0.
const stubClientSize = (el: HTMLElement, width: number, height: number) => {
    Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
};

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

describe('requestRender', () => {
    it('renders if render has been requested', () => {
        // Arrange
        const { canvas } = createCanvas();
        vi.useFakeTimers();
        vi.advanceTimersToNextFrame();
        vi.mocked(render).mockClear(); // Clear the call from the previous frame

        // Act
        canvas.requestRender();

        // Assert
        vi.advanceTimersToNextFrame();
        expect(vi.mocked(render)).toHaveBeenCalledOnce();
    });

    it('does not render if render has not been requested', () => {
        // Arrange
        const { canvas } = createCanvas();
        vi.useFakeTimers();
        vi.advanceTimersToNextFrame();
        vi.mocked(render).mockClear(); // Clear the call from the previous frame

        // Assert
        vi.advanceTimersToNextFrame();
        expect(vi.mocked(render)).not.toHaveBeenCalled();
    });

    it('renders once if render has been requested multiple times', () => {
        // Arrange
        const { canvas } = createCanvas();
        vi.useFakeTimers();
        vi.advanceTimersToNextFrame();
        vi.mocked(render).mockClear(); // Clear the call from the previous frame

        // Act
        canvas.requestRender();
        canvas.requestRender();
        canvas.requestRender();

        // Assert
        vi.advanceTimersToNextFrame();
        expect(vi.mocked(render)).toHaveBeenCalledOnce();
    });
});

describe('resize observer', () => {
    // happy-dom's ResizeObserver is a documented no-op: observe() does nothing and
    // the callback never fires. Swap in a fake that hands the callback to the test
    // so it can drive a resize itself.
    let triggerResize: () => void = () => {
        throw new Error('ResizeObserver was never constructed');
    };
    let observeSpy = vi.fn();

    beforeEach(() => {
        observeSpy = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            observe = observeSpy;
            unobserve = vi.fn();
            disconnect = vi.fn();

            constructor(callback: ResizeObserverCallback) {
                triggerResize = () => callback([], this as unknown as ResizeObserver);
            }
        });

        // Without a canvas adapter happy-dom returns null from getContext, and
        // resizeCanvas calls setTransform on it.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D);

        vi.useFakeTimers();
        vi.mocked(render).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('observes the canvas element', () => {
        // Arrange, Act
        const { canvasEl } = createCanvas();

        // Assert
        expect(observeSpy).toHaveBeenCalledWith(canvasEl);
    });

    it('matches the backing store to the display size on resize', () => {
        // Arrange
        const { canvasEl } = createCanvas();
        stubClientSize(canvasEl, 300, 150);

        // Act
        triggerResize();

        // Assert
        expect(canvasEl.width).toBe(300);
        expect(canvasEl.height).toBe(150);
    });

    it('scales the backing store by the device pixel ratio', () => {
        // Arrange
        const { canvasEl } = createCanvas();
        stubClientSize(canvasEl, 300, 150);
        vi.stubGlobal('devicePixelRatio', 2);

        // Act
        triggerResize();

        // Assert
        expect(canvasEl.width).toBe(600);
        expect(canvasEl.height).toBe(300);
    });

    it('renders on resize', () => {
        // Arrange
        const { canvasEl } = createCanvas();
        stubClientSize(canvasEl, 300, 150);

        // Act
        triggerResize();
        vi.advanceTimersToNextFrame();

        // Assert
        expect(vi.mocked(render)).toHaveBeenCalledOnce();
    });
});