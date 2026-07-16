export interface RadialCoordinates {
    q: number;
    r: number;
}

export interface HexData extends RadialCoordinates {
    terrainColor: string | null;
};

export class HexerData {
    private _hexes = new Map<string, HexData>();
    private readonly _version = "1.0";

    private static key(q: number, r: number): string {
        return `${q},${r}`;
    }

    public getHex(q: number, r: number): HexData | undefined {
        const key = HexerData.key(q, r);
        return this._hexes.get(key) || undefined;
    }

    public setHex(hex: HexData): void {
        const key = HexerData.key(hex.q, hex.r);
        this._hexes.set(key, hex);
    }
}

export interface HexerFrontmatter {
    hexer: HexerData
}

export function toFrontmatter(data: HexerData) {
    return { hexer: data };
}

export function fromFrontmatter(frontmatter: HexerFrontmatter): HexerData {
    const data = new HexerData();
    for (const hex of frontmatter.hexer['_hexes'].values()) {
        data.setHex(hex);
    }
    return data;
}