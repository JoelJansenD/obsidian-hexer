import { Hexagon } from "../logic/hexagon";
import { HexerData, HexerState } from "../logic/HexerData";

export interface HexerFrontmatter {
    hexer: Omit<HexerState, 'hexes'> & {
        hexes: Record<string, Hexagon>;
    };
}

export function toFrontmatter(data: HexerData): HexerFrontmatter {
    // A Map does not survive structured serialization (e.g. stringifyYaml),
    // so convert it to a plain object before it is written to disk.
    return {
        hexer: {
            version: data.version,
            size: data.size,
            hexes: Object.fromEntries(data.hexes),
            rivers: data.rivers,
            roads: data.roads
        },
    };
}

export function fromFrontmatter(frontmatter: HexerFrontmatter): HexerData {
    const { version, size, hexes } = frontmatter.hexer;
    return new HexerData({
        version,
        size,
        hexes: new Map(Object.entries(hexes ?? {})),
        rivers: frontmatter.hexer.rivers ?? [],
        roads: frontmatter.hexer.roads ?? []
    });
}
