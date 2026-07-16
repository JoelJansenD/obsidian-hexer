export interface RadialCoordinates {
    q: number;
    r: number;
}

export interface HexData extends RadialCoordinates {
    terrainColor: string | null;
};

export interface HexerState {
    version: string;
    hexes: Map<string, HexData>;
}

export class HexerData implements HexerState {
    public hexes: Map<string, HexData>;
    public readonly version: string;

    constructor(state: HexerState) {
        this.version = state.version;
        this.hexes = new Map(state.hexes);
    }

    private static key(q: number, r: number): string {
        return `${q},${r}`;
    }

    public getHex(q: number, r: number): HexData | undefined {
        const key = HexerData.key(q, r);
        return this.hexes.get(key) || undefined;
    }

    public setHex(hex: HexData): void {
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