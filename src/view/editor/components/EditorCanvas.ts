import { pointToHex } from "../../../logic/HexerData";
import { ToolEventHandler, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import render from "../../render";
import { ComponentOptions } from "../Editor";
import EditorTools from "./EditorTools";

const LEFT_MOUSE_BUTTON_CLICK = 0;
const RIGHT_MOUSE_BUTTON_CLICK = 2;

const LEFT_MOUSE_BUTTON_DRAG = 1;

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _resizeObserver!: ResizeObserver;
    private _tools!: EditorTools;
    private _listeners = new Map<string, EventListener>();

    private _renderRequested = false;

    // Identifies the in-progress pointer gesture. Every commit between a
    // press and its release shares this key so a whole drag becomes one undo
    // entry; null between gestures so the next press opens a fresh one.
    private _activeStroke: symbol | null = null;
    private _beginStroke = () => { this._activeStroke = Symbol('stroke'); };
    private _endStroke = () => { this._activeStroke = null; };

    constructor(private _parentEl: HTMLElement, private _dataOptions: ComponentOptions) {
        this.build();
    }

    public registerEvents(strategy: ToolStrategy) {
        const handlers = strategy.getEvents();

        if (handlers.onLeftClick || handlers.onRightClick) {
            const listener: EventListener = (e) => {
                e.preventDefault();
                
                const event = e as MouseEvent;
                if(handlers.onLeftClick && event.button === LEFT_MOUSE_BUTTON_CLICK) {
                    this.invokeMouseClickHandler(handlers.onLeftClick, event, LEFT_MOUSE_BUTTON_CLICK);
                }
                else if(handlers.onRightClick && event.button === RIGHT_MOUSE_BUTTON_CLICK) {
                    this.invokeMouseClickHandler(handlers.onRightClick, event, RIGHT_MOUSE_BUTTON_CLICK);
                }
            };
            this._canvasEl.addEventListener('mousedown', listener);
            this._listeners.set('mousedown', listener);
        }

        if (handlers.onLeftDoubleClick) {
            const listener: EventListener = (e) => this.invokeMouseClickHandler(handlers.onLeftDoubleClick!, e as MouseEvent, LEFT_MOUSE_BUTTON_CLICK);
            this._canvasEl.addEventListener('dblclick', listener);
            this._listeners.set('dblclick', listener);
        }

        if(handlers.onLeftDrag) {
            const listener: EventListener = (e) => this.invokeMouseDragHandler(handlers.onLeftDrag!, e as MouseEvent, LEFT_MOUSE_BUTTON_DRAG);
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
        this._canvasEl.removeEventListener('mousedown', this._beginStroke);
        this._canvasEl.removeEventListener('mouseup', this._endStroke);
        this._resizeObserver.disconnect();
    }

    /** Refreshes the tool buttons so only tools available for the active layer are shown. */
    public refreshTools() {
        this._tools.refresh();
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

        // Track pointer gestures independently of the active tool so that
        // strokes keep coalescing across tool changes. A press opens a stroke;
        // its release ends it. We deliberately don't end on mouseleave: a drag
        // that wanders off the canvas and back while held stays one gesture, and
        // the next press mints a fresh key regardless.
        this._canvasEl.addEventListener('mousedown', this._beginStroke);
        this._canvasEl.addEventListener('mouseup', this._endStroke);

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

    private invokeHandler(handler: ToolEventHandler, e: MouseEvent) {
        const data = this._dataOptions.getDataClone();
        const rect = this._canvasEl.getBoundingClientRect();
        // Invert the pan-and-zoom the renderer applied so the click maps back to
        // the same hex drawn under the cursor at any zoom: reverse the viewport
        // centring, undo the zoom, then re-add the camera's centre point.
        const { offset, zoom } = data.camera;
        const mapX = offset.x + (e.clientX - rect.left - this._canvasEl.clientWidth / 2) / zoom;
        const mapY = offset.y + (e.clientY - rect.top - this._canvasEl.clientHeight / 2) / zoom;
        const clickedHex = pointToHex(data, mapX, mapY);
        const editorState = this._dataOptions.getEditorState();
        handler(data, editorState, clickedHex);
        this._dataOptions.setData(data, { stroke: this._activeStroke ?? undefined });
        this.requestRender();
    }
}