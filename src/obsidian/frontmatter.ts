import { Hexagon } from "../logic/hexagon";
import { HexerData, HexerState } from "../logic/HexerData";
import { Path, PathEdge, PathNode } from "../logic/path";

export interface SerializedPath {
    id: string;
    name: string;
    nodes: Record<string, PathNode>;
    edges: PathEdge[];
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
            roads: data.roads.map(serializePath)
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
        roads: (frontmatter.hexer.roads ?? []).map(deserializePath)
    });
}

function serializePath(path: Path): SerializedPath {
    return {
        id: path.id,
        name: path.name,
        nodes: Object.fromEntries(path.nodes),
        edges: path.edges
    };
}

function deserializePath(path: SerializedPath): Path {
    return new Path({
        id: path.id,
        name: path.name,
        nodes: new Map(Object.entries(path.nodes ?? {})),
        edges: path.edges ?? []
    });
}
