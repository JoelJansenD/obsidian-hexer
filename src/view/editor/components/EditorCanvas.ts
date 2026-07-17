import { EditorState } from "../../../logic/EditorState";
import { pointToRadialCoordinates } from "../../../logic/hexagon";
import TerrainPaintStrategy from "../../../logic/toolStrategies/TerrainPaintStrategy";
import { RegisteredEvents, ToolStrategy } from "../../../logic/toolStrategies/ToolStrategy";
import { DataOptions } from "../Editor";
import EditorTools from "./EditorTools";

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
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

    private render() {
        console.log('rendering');
    }

    private requestRender() {
        if(this._renderRequested) {
            return false;
        }

        this._renderRequested = true;
        requestAnimationFrame(() => {
            this._renderRequested = false;
            this.render();
        });
    }

    private build() {
        const canvasAreaEl = this._parentEl.createEl('div', { cls: 'hexer-canvas-area' });
        this._canvasEl = canvasAreaEl.createEl('canvas', { cls: 'hexer-canvas' });
        
        const tools = new EditorTools(canvasAreaEl);
    }

    private registerEvents(strategy: ToolStrategy) {
        const events = strategy.getEvents();
        for(const eventKey in events) {
            const event = events[eventKey as keyof RegisteredEvents];
            if(!event) continue;

            const listener = (e: Event) => {
                const data = this._dataOptions.getData();
                const hexMap = data.hexes;
                const clickedHex = pointToRadialCoordinates((e as MouseEvent).clientX, (e as MouseEvent).clientY, 50); // Assuming a hex size of 50
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