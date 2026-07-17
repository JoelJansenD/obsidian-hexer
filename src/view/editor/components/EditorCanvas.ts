import { EditorState } from "../../../logic/EditorState";
import { pointToRadialCoordinates } from "../../../logic/hexagon";
import TerrainPaintStrategy from "../../../logic/toolStrategies/TerrainPaintStrategy";
import { RegisteredEvents, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import render from "../../render";
import { DataOptions } from "../Editor";
import EditorTools from "./EditorTools";

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _resizeObserver!: ResizeObserver;
    private _listeners = new Map<string, EventListener>();
    
    private _editorState: EditorState = {
        activeColour: '#000000',
        activeLayer: 'terrain',
        activePaintTool: 'select'
    };

    private _renderRequested = false;

    constructor(private _parentEl: HTMLElement, private _dataOptions: DataOptions) {
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
        const tools = new EditorTools(canvasAreaEl);

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
        const events = strategy.getEvents();
        for(const eventKey in events) {
            const event = events[eventKey as keyof RegisteredEvents];
            if(!event) continue;

            const listener = (e: Event) => {
                const data = this._dataOptions.getData();
                const hexMap = data.hexes;
                const rect = this._canvasEl.getBoundingClientRect();
                const canvasX = (e as MouseEvent).clientX - rect.left;
                const canvasY = (e as MouseEvent).clientY - rect.top;
                const clickedHex = pointToRadialCoordinates(canvasX, canvasY, data.size);
                event(hexMap, this._editorState, clickedHex);
                this._dataOptions.setData(data);
                this.requestRender();
            };
            this._canvasEl.addEventListener(eventKey, listener);
            this._listeners.set(eventKey, listener);
        }
    }

    private unregisterEvents(registeredEvents: RegisteredEvents) {
        const events = Object.keys(registeredEvents);
        for (const event of events) {
            const listener = this._listeners.get(event);
            if(!listener) continue;

            this._canvasEl.removeEventListener(event, listener);
            this._listeners.delete(event);
        }
    }
}