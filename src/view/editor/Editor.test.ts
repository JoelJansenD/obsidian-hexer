// @vitest-environment happy-dom
import createHexerData from "../../__test/createHexerData";
import { HexerData } from "../../logic/HexerData";
import { CommitOptions } from "./Editor";
import { ObsidianInterop } from "../ObsidianInterop";
import render from "../render";
import Editor from "./Editor";

// happy-dom has no canvas context, so keep the renderer out of the way.
vi.mock('../render', () => ({ default: vi.fn() }));

const noopObsidian = {
    openItemSettings: vi.fn(),
    showFilePreview: vi.fn(),
    openFile: vi.fn(),
    openMapSettings: vi.fn(),
    print: vi.fn().mockResolvedValue(undefined),
} as ObsidianInterop;

const createEditor = () => {
    let data = createHexerData();
    const setData = vi.fn<(next: HexerData, commit?: CommitOptions) => void>((next) => { data = next; });
    const parent = document.createElement('div');
    const editor = new Editor(
        parent,
        { getDataClone: () => structuredClone(data), setData },
        noopObsidian);
    return { editor, parent, setData };
};

const editorEl = (parent: HTMLElement) => parent.querySelector<HTMLElement>('.hexer-editor')!;
const toggle = (parent: HTMLElement) => parent.querySelector<HTMLElement>('[data-hexer-action="toggle-mode"]')!;
const sidebar = (parent: HTMLElement) => parent.querySelector<HTMLElement>('.hexer-sidebar')!;
const tools = (parent: HTMLElement) => parent.querySelector<HTMLElement>('.hexer-tools')!;
const actionBar = (parent: HTMLElement) => parent.querySelector<HTMLElement>('.hexer-action-bar')!;
const canvasEl = (parent: HTMLElement) => parent.querySelector<HTMLCanvasElement>('.hexer-canvas')!;

const toolButton = (parent: HTMLElement, tool: string) =>
    parent.querySelector<HTMLElement>(`.hexer-tools-button[data-hexer-paint-tool="${tool}"]`)!;
const layerHeader = (parent: HTMLElement, layer: string) =>
    parent.querySelector<HTMLElement>(`[data-hexer-layer="${layer}"]`)!;
const section = (parent: HTMLElement, layer: string) =>
    layerHeader(parent, layer).closest('.hexer-sidebar-section')!;

const click = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
const mouse = (type: string, init: MouseEventInit) =>
    new MouseEvent(type, { bubbles: true, cancelable: true, ...init });

const sidebarVisible = (parent: HTMLElement) => !sidebar(parent).classList.contains('hexer-sidebar-hidden');
const toolsVisible = (parent: HTMLElement) => !tools(parent).classList.contains('hexer-tools-hidden');

describe('opening a map', () => {
    // Scenario: A map opens in view mode.
    it('opens read-only in view mode, showing the action bar but not the editing UI', () => {
        // Act
        const { parent } = createEditor();

        // Assert
        expect(editorEl(parent).dataset.hexerMode).toBe('view');
        expect(actionBar(parent)).not.toBeNull();
        expect(sidebarVisible(parent)).toBe(false);
        expect(toolsVisible(parent)).toBe(false);
    });

    it('reports view as the current mode, so read-only enforcement can gate on it', () => {
        // Act
        const { editor } = createEditor();

        // Assert
        expect(editor.getMode()).toBe('view');
    });
});

describe('entering and exiting edit mode', () => {
    // Scenario: Entering edit mode from the action bar.
    it('reveals the sidebar and tools when the action-bar toggle is clicked', () => {
        // Arrange
        const { parent } = createEditor();

        // Act
        click(toggle(parent));

        // Assert
        expect(editorEl(parent).dataset.hexerMode).toBe('edit');
        expect(sidebarVisible(parent)).toBe(true);
        expect(toolsVisible(parent)).toBe(true);
        expect(actionBar(parent)).not.toBeNull();
    });

    // Scenario: Exiting edit mode from the action bar.
    it('hides the sidebar and tools again when the toggle is clicked a second time', () => {
        // Arrange
        const { parent } = createEditor();
        click(toggle(parent));

        // Act
        click(toggle(parent));

        // Assert
        expect(editorEl(parent).dataset.hexerMode).toBe('view');
        expect(sidebarVisible(parent)).toBe(false);
        expect(toolsVisible(parent)).toBe(false);
    });

    // Scenario: Toggling mode with the Ctrl+E command — the command's seam is
    // HexerView.toggleMode(), which delegates straight to Editor.toggleMode().
    it('flips the mode each time toggleMode is called', () => {
        // Arrange
        const { editor } = createEditor();

        // Act, Assert
        editor.toggleMode();
        expect(editor.getMode()).toBe('edit');
        editor.toggleMode();
        expect(editor.getMode()).toBe('view');
    });
});

describe('read-only canvas in view mode', () => {
    // Scenario: The canvas is not editable in view mode.
    it('wires no paint interaction, so a click on the canvas paints nothing', () => {
        // Arrange
        const { parent, setData } = createEditor();

        // Act — a left press on the canvas while in view mode.
        canvasEl(parent).dispatchEvent(mouse('mousedown', { button: 0, clientX: 5, clientY: 5 }));

        // Assert — nothing was committed to the data.
        expect(setData).not.toHaveBeenCalled();
    });

    it('wires the active tool once in edit mode, so a click then paints', () => {
        // Arrange
        const { parent, setData } = createEditor();
        click(toggle(parent));
        // The brush is the simplest painting tool on the default terrain layer.
        click(toolButton(parent, 'brush'));

        // Act
        canvasEl(parent).dispatchEvent(mouse('mousedown', { button: 0, clientX: 5, clientY: 5 }));

        // Assert — the paint tool committed an edit.
        expect(setData).toHaveBeenCalled();
    });
});

describe('camera in view mode', () => {
    // Scenario: The camera still works in view mode.
    it('pans with the middle mouse button, committing a camera-only move', () => {
        // Arrange
        const { parent, setData } = createEditor();

        // Act — middle-button drag across the canvas.
        canvasEl(parent).dispatchEvent(mouse('mousedown', { button: 1, clientX: 200, clientY: 200 }));
        canvasEl(parent).dispatchEvent(mouse('mousemove', { buttons: 4, clientX: 300, clientY: 260 }));

        // Assert — a camera move persists but records no undo entry.
        expect(setData).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ commitHistory: false }));
    });

    // Scenario: Zoom to fit works in view mode.
    it('frames the map from the action bar without recording an undo entry', () => {
        // Arrange
        const { parent, setData } = createEditor();
        const fitButton = parent.querySelector<HTMLElement>('[aria-label="Zoom to fit"]')!;

        // Act
        click(fitButton);

        // Assert
        expect(setData).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ commitHistory: false }));
    });
});

describe('switching modes resets the edit state', () => {
    // Scenario: Switching modes resets the edit state.
    it('returns to the default layer and tool when re-entering edit mode', () => {
        // Arrange — enter edit and move off the defaults.
        const { parent } = createEditor();
        click(toggle(parent));
        click(layerHeader(parent, 'icon'));
        click(toolButton(parent, 'brush'));
        // Sanity: the non-default selections took effect.
        expect(section(parent, 'icon').classList.contains('is-expanded')).toBe(true);
        expect(toolButton(parent, 'brush').classList.contains('active')).toBe(true);

        // Act — leave edit mode and come back.
        click(toggle(parent));
        click(toggle(parent));

        // Assert — the select tool and terrain layer are active again.
        expect(toolButton(parent, 'select').classList.contains('active')).toBe(true);
        expect(toolButton(parent, 'brush').classList.contains('active')).toBe(false);
        expect(section(parent, 'terrain').classList.contains('is-expanded')).toBe(true);
        expect(section(parent, 'icon').classList.contains('is-expanded')).toBe(false);
    });
});

afterEach(() => {
    vi.mocked(render).mockClear();
});
