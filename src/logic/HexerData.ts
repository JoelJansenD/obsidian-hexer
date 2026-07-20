import { Hexagon, RadialCoordinates } from "./hexagon";


export interface HexerState {
    version: string;
    hexes: HexMap;
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

    constructor(state: HexerState) {
        this.version = state.version;
        this.hexes = state.hexes instanceof Map 
            ? state.hexes
            : new Map(Object.entries(state.hexes));
        this.size = state.size;
    }

    public getHex(coordinates: RadialCoordinates): Hexagon | undefined;
    public getHex(q: number, r: number): Hexagon | undefined;
    public getHex(arg1: RadialCoordinates | number, arg2?: number): Hexagon | undefined {
        const q = typeof arg1 === 'object' ? arg1.q : arg1;
        const r = typeof arg1 === 'object' ? arg1.r : arg2!; 
        const key = hexKey(q, r);
        return this.hexes.get(key) || undefined;
    }

    public setHex(hex: Hexagon): void {
        const key = hexKey(hex.q, hex.r);
        this.hexes.set(key, hex);
    }

    public clone(): HexerData {
        const hexes: HexMap = new Map();
        for (const [key, hex] of this.hexes) {
            hexes.set(key, { ...hex });
        }
        return new HexerData({ ...this, hexes });
    }
}

export const initialFileContent =
`---
hexer:
  version: "1.0"
  size: 50
  hexes: {}
---
`;

export const CURRENT_VERSION = '1.0';