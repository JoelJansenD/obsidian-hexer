import { Hexagon, RadialCoordinates } from "./hexagon";


export interface HexerState {
    version: string;
    hexes: HexMap;
}

export type HexMap = Map<string, Hexagon>;

export class HexerData implements HexerState {
    public hexes: HexMap;
    public readonly version: string;

    constructor(state: HexerState) {
        this.version = state.version;
        this.hexes = new Map(state.hexes);
    }

    private static key(q: number, r: number): string {
        return `${q},${r}`;
    }

    public getHex(coordinates: RadialCoordinates): Hexagon | undefined;
    public getHex(q: number, r: number): Hexagon | undefined;
    public getHex(arg1: RadialCoordinates | number, arg2?: number): Hexagon | undefined {
        const q = typeof arg1 === 'object' ? arg1.q : arg1;
        const r = typeof arg1 === 'object' ? arg1.r : arg2!; 
        const key = HexerData.key(q, r);
        return this.hexes.get(key) || undefined;
    }

    public setHex(hex: Hexagon): void {
        const key = HexerData.key(hex.q, hex.r);
        this.hexes.set(key, hex);
    }
}

export interface HexerFrontmatter {
    hexer: HexerState
}

export function toFrontmatter(data: HexerData) {
    return { hexer: data };
}

export function fromFrontmatter(frontmatter: HexerFrontmatter): HexerData {
    return new HexerData(frontmatter.hexer);
}

export const initialFileContent =
`---
hexer:
  version: "1.0"
  hexes: {}
---
`;

export const CURRENT_VERSION = '1.0';