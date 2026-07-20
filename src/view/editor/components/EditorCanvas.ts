import { pointToRadialCoordinates } from "../../../logic/hexagon";
import TerrainPaintStrategy from "../../../logic/toolStrategies/TerrainPaintStrategy";
import { ToolEventHandler, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import render from "../../render";
import { ComponentOptions } from "../Editor";
import EditorTools from "./EditorTools";

const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _resizeObserver!: ResizeObserver;
    private _listeners = new Map<string, EventListener>();
    

    private _renderRequested = false;

    constructor(private _parentEl: HTMLElement, private _dataOptions: ComponentOptions) {
        this.build();
        this.registerEvents(new TerrainPaintStrategy());
    }

    private requestRender() {
        if(this._renderRequested) {
            return false;
        }

        this._renderRequested = true;
        requestAnimationFrame(() => {
            this._renderRequested = false;
            render(this._context, this._dataOptions.getData());
        });
    }

    private build() {
        const canvasAreaEl = this._parentEl.createEl('div', { cls: 'hexer-canvas-area' });
        this._canvasEl = canvasAreaEl.createEl('canvas', { cls: 'hexer-canvas' });
        this._context = this._canvasEl.getContext('2d')!;
        
        const tools = new EditorTools(canvasAreaEl, this._dataOptions);

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

    private registerEvents(strategy: ToolStrategy) {
        const handlers = strategy.getEvents();

        if (handlers.onLeftClick) {
            const handler = handlers.onLeftClick;
            const listener: EventListener = (e) => this.invokeMouseHandler(handler, e as MouseEvent, LEFT_MOUSE_BUTTON);
            this._canvasEl.addEventListener('mousedown', listener);
            this._listeners.set('mousedown', listener);
        }
    }

    private invokeMouseHandler(handler: ToolEventHandler, e: MouseEvent, mouseButton: number) {
        if(e.button !== mouseButton) {
            return;
        }
        this.invokeHandler(handler, e);
    }

    private invokeHandler(handler: ToolEventHandler, e: MouseEvent) {
        const data = this._dataOptions.getData();
        const rect = this._canvasEl.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        const clickedHex = pointToRadialCoordinates(canvasX, canvasY, data.size);
        const editorState = this._dataOptions.getEditorState();
        handler(data.hexes, editorState, clickedHex);
        this._dataOptions.setData(data);
        this._dataOptions.setEditorState(editorState);
        this.requestRender();
    }

    private unregisterEvents() {
        for (const [event, listener] of this._listeners) {
            this._canvasEl.removeEventListener(event, listener);
        }
        this._listeners.clear();
    }
}