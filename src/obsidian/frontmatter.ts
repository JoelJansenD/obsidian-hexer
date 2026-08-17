import { Hexagon } from "../logic/hexagon";
import { HexerData, HexerState } from "../logic/HexerData";
import { Path, PathEdge, PathNode } from "../logic/path";

/** Matches the leading `---\n...\n---` YAML frontmatter block of a Hexer file. */
export const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

export interface SerializedPath {
    id: string;
    name: string;
    nodes: Record<string, PathNode>;
    edges: PathEdge[];
    color: string;
    filePath: string | null;
}

export interface HexerFrontmatter {
    hexer: Omit<HexerState, 'hexes' | 'rivers' | 'roads'> & {
        hexes: Record<string, Hexagon>;
        rivers: SerializedPath[];
        roads: SerializedPath[];
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
            rivers: data.rivers.map(serializePath),
            roads: data.roads.map(serializePath),
            factions: data.factions.map(faction => ({ ...faction })),
        },
    };
}

export function fromFrontmatter(frontmatter: HexerFrontmatter): HexerData {
    const { version, size, hexes } = frontmatter.hexer;
    return new HexerData({
        version,
        size,
        hexes: new Map(Object.entries(hexes ?? {})),
        rivers: (frontmatter.hexer.rivers ?? []).map(deserializePath),
        roads: (frontmatter.hexer.roads ?? []).map(deserializePath),
        factions: frontmatter.hexer.factions ?? []
    });
}

export function serializePath(path: Path): SerializedPath {
    return {
        id: path.id,
        name: path.name,
        nodes: Object.fromEntries(path.nodes),
        edges: path.edges,
        color: path.color,
        filePath: path.filePath
    };
}

function deserializePath(path: SerializedPath): Path {
    return new Path({
        id: path.id,
        name: path.name,
        nodes: new Map(Object.entries(path.nodes ?? {})),
        edges: path.edges ?? [],
        color: path.color,
        filePath: path.filePath
    });
}
