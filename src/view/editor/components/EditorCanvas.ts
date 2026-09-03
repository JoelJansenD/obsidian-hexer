import { LEFT_MOUSE_BUTTON, LEFT_MOUSE_BUTTON_HELD, RIGHT_MOUSE_BUTTON } from "../../../constants/mouse";
import { fitCamera, screenToMap } from "../../../logic/camera";
import { CameraCursor, CameraStrategy } from "../../../logic/CameraStrategy";
import { ViewMode, PaintTool } from "../../../logic/EditorState";
import { getHex, HexerData, pointToHex } from "../../../logic/HexerData";
import { hexagonIsEmpty } from "../../../logic/hexagon";
import { ToolEventHandler, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import render from "../../render";
import { buildPrintImage } from "../../print";
import { ComponentOptions } from "../Editor";
import EditorActionBar from "./EditorActionBar";
import EditorTools from "./EditorTools";

// Maps the strategy's intent-named cursor to the CSS cursor the canvas shows.
const CAMERA_CURSOR_STYLE: Record<Exclude<CameraCursor, null>, string> = {
    'pan-armed': 'grab',
    'panning': 'grabbing',
};

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _resizeObserver!: ResizeObserver;
    private _tools!: EditorTools;
    private _actionBar!: EditorActionBar;
    private _listeners = new Map<string, EventListener>();

    private _renderRequested = false;

    // True while a print dialog is open, so a second click is ignored rather than
    // stacking another print window behind the first.
    private _printing = false;

    // Identifies the in-progress pointer gesture. Every commit between a
    // press and its release shares this key so a whole drag becomes one undo
    // entry; null between gestures so the next press opens a fresh one.
    private _activeStroke: symbol | null = null;
    private _beginStroke = () => { this._activeStroke = Symbol('stroke'); };
    private _endStroke = () => { this._activeStroke = null; };

    // Always-on pan/zoom gesture handling, independent of the active paint tool.
    private _cameraStrategy = new CameraStrategy();
    private _pointerOverCanvas = false;
    private _cameraCleanups: (() => void)[] = [];

    // View mode's canvas gesture: a double-click on a non-empty hex opens its
    // note. Held separately from the tool-strategy listeners so it survives the
    // unregister/register churn a tool switch triggers, and is toggled by mode.
    private _viewNoteListener: EventListener | null = null;

    constructor(private _parentEl: HTMLElement, private _dataOptions: ComponentOptions) {
        this.build();
    }

    public registerEvents(strategy: ToolStrategy) {
        const handlers = strategy.getEvents();

        if (handlers.onLeftClick || handlers.onRightClick) {
            const listener: EventListener = (e) => {
                e.preventDefault();
                
                const event = e as MouseEvent;
                if(handlers.onLeftClick && event.button === LEFT_MOUSE_BUTTON) {
                    this.invokeMouseClickHandler(handlers.onLeftClick, event, LEFT_MOUSE_BUTTON);
                }
                else if(handlers.onRightClick && event.button === RIGHT_MOUSE_BUTTON) {
                    this.invokeMouseClickHandler(handlers.onRightClick, event, RIGHT_MOUSE_BUTTON);
                }
            };
            this._canvasEl.addEventListener('mousedown', listener);
            this._listeners.set('mousedown', listener);
        }

        if (handlers.onLeftDoubleClick) {
            const listener: EventListener = (e) => this.invokeMouseClickHandler(handlers.onLeftDoubleClick!, e as MouseEvent, LEFT_MOUSE_BUTTON);
            this._canvasEl.addEventListener('dblclick', listener);
            this._listeners.set('dblclick', listener);
        }

        if(handlers.onLeftDrag) {
            const listener: EventListener = (e) => this.invokeMouseDragHandler(handlers.onLeftDrag!, e as MouseEvent, LEFT_MOUSE_BUTTON_HELD);
            this._canvasEl.addEventListener('mousemove', listener);
            this._listeners.set('mousemove', listener);
        }
    }

    public unregisterEvents() {
        for (const [event, listener] of this._listeners) {
            this._canvasEl.removeEventListener(event, listener);
        }
        this._listeners.clear();
    }

    /**
     * Releases everything attached outside the canvas element, so the canvas can
     * be discarded when the view is closed or reloaded.
     */
    public destroy() {
        this.unregisterEvents();
        this.setViewNoteNavigation(false);
        this._canvasEl.removeEventListener('mousedown', this._beginStroke);
        this._canvasEl.removeEventListener('mouseup', this._endStroke);
        for (const cleanup of this._cameraCleanups) {
            cleanup();
        }
        this._cameraCleanups = [];
        this._resizeObserver.disconnect();
    }

    /** Refreshes the tool buttons so only tools available for the active layer are shown. */
    public refreshTools() {
        this._tools.refresh();
    }

    /**
     * Reflects the top-level mode on the canvas area: the paint-tool cluster shows
     * only in Edit, while the action bar (which stays in both modes) updates its
     * toggle affordance.
     */
    public setMode(mode: ViewMode) {
        this._tools.setVisible(mode === 'edit');
        this._actionBar.setMode(mode);
        this.setViewNoteNavigation(mode === 'view');
    }

    /**
     * Wires (or unwires) View mode's double-click-to-open-note gesture. Edit
     * mode leaves double-click to the active tool (e.g. polygon connect), so the
     * two never contend for the gesture.
     */
    private setViewNoteNavigation(enabled: boolean) {
        if (enabled === (this._viewNoteListener !== null)) {
            return;
        }
        if (enabled) {
            this._viewNoteListener = (e) => this.openHexNoteAt(e as MouseEvent);
            this._canvasEl.addEventListener('dblclick', this._viewNoteListener);
        } else {
            this._canvasEl.removeEventListener('dblclick', this._viewNoteListener!);
            this._viewNoteListener = null;
        }
    }

    // Hit-tests the double-clicked point and, when it lands on a non-empty hex,
    // asks the host to open that hex's note. Blank cells are a no-op, and a pan
    // that happens to end on a double-click is ignored.
    private openHexNoteAt(e: MouseEvent) {
        if (this._cameraStrategy.isPanning) {
            return;
        }
        const data = this._dataOptions.getDataClone();
        const rect = this._canvasEl.getBoundingClientRect();
        const mapPoint = screenToMap(
            data.camera,
            this.viewport(),
            { x: e.clientX - rect.left, y: e.clientY - rect.top });
        const coordinate = pointToHex(data, mapPoint.x, mapPoint.y);
        const hex = getHex(data, coordinate);
        if (!hex || hexagonIsEmpty(hex)) {
            return;
        }
        this._dataOptions.obsidian.openHexNote({ coordinate, event: e });
    }

    /** Highlights the given paint tool in the cluster. */
    public setActiveTool(tool: PaintTool) {
        this._tools.setActiveTool(tool);
    }

    public requestRender() {
        if(this._renderRequested) {
            return;
        }

        this._renderRequested = true;
        requestAnimationFrame(() => {
            this._renderRequested = false;
            render(this._context, this._dataOptions.getDataClone(), this._dataOptions.getEditorState());
        });
    }

    private build() {
        const canvasAreaEl = this._parentEl.createEl('div', { cls: 'hexer-canvas-area' });
        this._canvasEl = canvasAreaEl.createEl('canvas', { cls: 'hexer-canvas' });
        this._context = this._canvasEl.getContext('2d')!;
        
        this._tools = new EditorTools(canvasAreaEl, this._dataOptions);
        this._actionBar = new EditorActionBar(canvasAreaEl, {
            onZoomToFit: () => this.zoomToFit(),
            onToggleMode: () => this._dataOptions.toggleMode(),
            onPrint: () => { void this.print(); },
        });

        // Track pointer gestures independently of the active tool so that
        // strokes keep coalescing across tool changes. A press opens a stroke;
        // its release ends it. We deliberately don't end on mouseleave: a drag
        // that wanders off the canvas and back while held stays one gesture, and
        // the next press mints a fresh key regardless.
        this._canvasEl.addEventListener('mousedown', this._beginStroke);
        this._canvasEl.addEventListener('mouseup', this._endStroke);

        this.registerCameraEvents();

        this._resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
            this.requestRender();
        });
        this._resizeObserver.observe(this._canvasEl);
    }

    private resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = this._canvasEl.clientWidth;
        const height = this._canvasEl.clientHeight;

        // Match the backing store to the display size in physical pixels.
        this._canvasEl.width = Math.round(width * dpr);
        this._canvasEl.height = Math.round(height * dpr);

        // Setting width/height resets the context, so re-apply the DPR scale
        // so drawing code can keep working in CSS-pixel coordinates.
        this._context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    private invokeMouseClickHandler(handler: ToolEventHandler, e: MouseEvent, mouseButton: number) {
        if(e.button === mouseButton) {
            this.invokeHandler(handler, e);
        }
    }

    private invokeMouseDragHandler(handler: ToolEventHandler, e: MouseEvent, mouseButton: number) {
        if(e.buttons & mouseButton) {
            this.invokeHandler(handler, e);
        }
    }

    /**
     * Wires the always-on pan/zoom gestures to the canvas: middle-drag and
     * Space+left-drag pan, cursor-anchored wheel zoom. Every camera move commits
     * with `commitHistory: false`, so it persists but records no undo entry. The
     * gesture state lives in the {@link CameraStrategy}; this only forwards DOM
     * events to it and commits whatever camera it returns.
     */
    private registerCameraEvents() {
        const add = (target: EventTarget, type: string, listener: EventListener, options?: AddEventListenerOptions) => {
            target.addEventListener(type, listener, options);
            this._cameraCleanups.push(() => target.removeEventListener(type, listener, options));
        };

        // A pan begins on the middle button, or the left button while Space is
        // held. preventDefault stops the browser's middle-click autoscroll.
        add(this._canvasEl, 'mousedown', (e) => {
            const event = e as MouseEvent;
            if (this._cameraStrategy.beginPan(event.button, { x: event.clientX, y: event.clientY })) {
                event.preventDefault();
                this.updateCursor();
            }
        });

        add(this._canvasEl, 'mousemove', (e) => {
            if (!this._cameraStrategy.isPanning) {
                return;
            }
            const event = e as MouseEvent;
            const data = this._dataOptions.getDataClone();
            const panned = this._cameraStrategy.pan(data.camera, { x: event.clientX, y: event.clientY });
            if (!panned) {
                return;
            }
            data.camera = panned;
            this.commitCamera(data);
        });

        // A pan can end past the canvas edge, so watch for the release on the window.
        add(window, 'mouseup', () => {
            if (!this._cameraStrategy.isPanning) {
                return;
            }
            this._cameraStrategy.endPan();
            this.updateCursor();
        });

        // passive: false so preventDefault can stop the editor pane from scrolling.
        add(this._canvasEl, 'wheel', (e) => {
            const event = e as WheelEvent;
            event.preventDefault();
            const rect = this._canvasEl.getBoundingClientRect();
            const data = this._dataOptions.getDataClone();
            data.camera = this._cameraStrategy.zoom(
                data.camera,
                { x: event.clientX - rect.left, y: event.clientY - rect.top },
                event.deltaY,
                this.viewport());
            this.commitCamera(data);
        }, { passive: false });

        // Space arms left-drag panning, but only while the pointer is over the
        // canvas, so it never swallows the space bar elsewhere in the app.
        add(this._canvasEl, 'mouseenter', () => { this._pointerOverCanvas = true; });
        add(this._canvasEl, 'mouseleave', () => { this._pointerOverCanvas = false; });
        add(window, 'keydown', (e) => {
            const event = e as KeyboardEvent;
            if (event.code !== 'Space' || !this._pointerOverCanvas) {
                return;
            }
            event.preventDefault();
            this._cameraStrategy.setSpaceHeld(true);
            this.updateCursor();
        });
        add(window, 'keyup', (e) => {
            if ((e as KeyboardEvent).code !== 'Space') {
                return;
            }
            this._cameraStrategy.setSpaceHeld(false);
            this.updateCursor();
        });
    }

    /**
     * Renders the whole map and opens the OS print dialog. Read-only and
     * camera-independent, so it works in both View and Edit mode. Builds the print
     * raster here, then hands it to the Obsidian layer, which prints it from an
     * isolated window (Electron is off-limits to the view).
     */
    public async print() {
        // A print holds an OS dialog open; ignore further clicks until it returns,
        // so rapid clicks can't stack up several print windows.
        if (this._printing) {
            return;
        }
        this._printing = true;
        try {
            const image = buildPrintImage(this._dataOptions.getDataClone(), this._canvasEl.ownerDocument);
            await this._dataOptions.obsidian.print(image);
        } finally {
            this._printing = false;
        }
    }

    /** Frames the whole map in the viewport. A camera-only move, like pan and zoom. */
    private zoomToFit() {
        const data = this._dataOptions.getDataClone();
        data.camera = fitCamera(data, this.viewport());
        this.commitCamera(data);
    }

    /** Adopts a camera-only move: persists and saves it, but records no undo entry. */
    private commitCamera(data: HexerData) {
        this._dataOptions.setData(data, { commitHistory: false });
        this.requestRender();
    }

    /** The canvas's current display size, the viewport the camera maths work over. */
    private viewport() {
        return { width: this._canvasEl.clientWidth, height: this._canvasEl.clientHeight };
    }

    /** Reflects the gesture state on the canvas cursor: grab when armed, grabbing mid-pan. */
    private updateCursor() {
        const cursor = this._cameraStrategy.cursor;
        this._canvasEl.style.cursor = cursor ? CAMERA_CURSOR_STYLE[cursor] : '';
    }

    private invokeHandler(handler: ToolEventHandler, e: MouseEvent) {
        // A pan gesture (middle-drag or Space+left-drag) suppresses the paint tool.
        if (this._cameraStrategy.isPanning) {
            return;
        }
        const data = this._dataOptions.getDataClone();
        const rect = this._canvasEl.getBoundingClientRect();
        // Invert the pan-and-zoom the renderer applied so the click maps back to
        // the same hex drawn under the cursor at any zoom.
        const mapPoint = screenToMap(
            data.camera,
            this.viewport(),
            { x: e.clientX - rect.left, y: e.clientY - rect.top });
        const clickedHex = pointToHex(data, mapPoint.x, mapPoint.y);
        const editorState = this._dataOptions.getEditorState();
        handler(data, editorState, clickedHex);
        this._dataOptions.setData(data, { stroke: this._activeStroke ?? undefined });
        this.requestRender();
    }
}