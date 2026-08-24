import { Faction } from "./faction";
import { Hexagon, hexagonIsEmpty, RadialCoordinates } from "./hexagon";
import { defaultMapSettings, MapSettings } from "./mapSettings";
import { Path } from "./path";


export interface HexerState {
    version: string;
    hexes: HexMap;
    rivers: Path[];
    roads: Path[];
    factions: Faction[];
    mapSettings: MapSettings;
    size: number;
}

export type HexMap = Map<string, Hexagon>;

export function hexKey(q: number, r: number): string {
    return `${q},${r}`;
}

export class HexerData implements HexerState {
    public hexes: HexMap;
    public readonly version: string;
    public size: number;
    public rivers: Path[];
    public roads: Path[];
    public factions: Faction[];
    public mapSettings: MapSettings;

    constructor(state: HexerState) {
        this.version = state.version;
        this.hexes = state.hexes instanceof Map
            ? state.hexes
            : new Map(Object.entries(state.hexes));
        this.size = state.size;
        this.rivers = state.rivers;
        this.roads = state.roads;
        this.factions = state.factions;
        this.mapSettings = state.mapSettings ?? defaultMapSettings();
    }

    public getHex(coordinates: RadialCoordinates): Hexagon | undefined;
    public getHex(q: number, r: number): Hexagon | undefined;
    public getHex(arg1: RadialCoordinates | number, arg2?: number): Hexagon | undefined {
        const q = typeof arg1 === 'object' ? arg1.q : arg1;
        const r = typeof arg1 === 'object' ? arg1.r : arg2!; 
        const key = hexKey(q, r);
        return this.hexes.get(key);
    }

    public getOrCreateHex(coordinates: RadialCoordinates): Hexagon;
    public getOrCreateHex(q: number, r: number): Hexagon;
    public getOrCreateHex(arg1: RadialCoordinates | number, arg2?: number): Hexagon {
        const q = typeof arg1 === 'object' ? arg1.q : arg1;
        const r = typeof arg1 === 'object' ? arg1.r : arg2!;
        const key = hexKey(q, r);
        const hex = this.hexes.get(key);
        if(hex) {
            return hex;
        }

        const newHex = {
            q: q,
            r: r,
            terrainColor: null,
            icon: null,
            factionId: null
        };
        this.hexes.set(key, newHex);
        return newHex;
    }

    public setHex(hex: Hexagon): void {
        const key = hexKey(hex.q, hex.r);
        this.hexes.set(key, hex);
    }

    public deleteHex(coordinates: RadialCoordinates): void;
    public deleteHex(q: number, r: number): void;
    public deleteHex(arg1: RadialCoordinates | number, arg2?: number): void {
        const q = typeof arg1 === 'object' ? arg1.q : arg1;
        const r = typeof arg1 === 'object' ? arg1.r : arg2!;
        this.hexes.delete(hexKey(q, r));
    }

    /**
     * Persists a hexagon after an erase: an empty hexagon is removed from the map
     * entirely, otherwise it is written back with its remaining properties.
     */
    public eraseIfEmpty(hex: Hexagon): void {
        if(hexagonIsEmpty(hex)) {
            this.deleteHex(hex.q, hex.r);
        }
        else {
            this.setHex(hex);
        }
    }

    public clone(): HexerData {
        const hexes: HexMap = new Map();
        for (const [key, hex] of this.hexes) {
            hexes.set(key, { ...hex });
        }
        const rivers = this.rivers.map(path => path.clone());
        const roads = this.roads.map(path => path.clone());
        const factions = this.factions.map(faction => ({ ...faction }));
        const mapSettings = { ...this.mapSettings };
        return new HexerData({ ...this, hexes, rivers, roads, factions, mapSettings });
    }
}

export const CURRENT_VERSION = '1.0';
export const initialFileContent =
`---
hexer:
  version: "${CURRENT_VERSION}"
  mapSettings:
    name: ""
    hexOrientation: "flat-top"
    displayHexBorders: true
    displayCrosshair: true
  size: 50
  hexes: {}
  rivers: []
  roads: []
  factions: []
---
`;