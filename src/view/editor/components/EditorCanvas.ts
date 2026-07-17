import TerrainPaintStrategy from "../../../logic/strategies/TerrainPaintStrategy";
import { RegisteredEvents, ToolStrategy } from "../../../logic/strategies/ToolStrategy";
import EditorTools from "./EditorTools";

export default class EditorCanvas {

    private _canvasEl!: HTMLCanvasElement;
    private _listeners = new Map<string, EventListener>();

    constructor(private _parentEl: HTMLElement) {
        this.build();
        this.registerEvents(new TerrainPaintStrategy());
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
            console.log(event);
            if(!event) continue;

            const listener = (e: Event) => {
                console.log(e)
                const hexMap = new Map<string, any>(); // Placeholder for actual hexMap
                const clickedHex = { q: 0, r: 0, terrainColor: null }; // Placeholder for actual clickedHex
                event(hexMap, clickedHex);
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