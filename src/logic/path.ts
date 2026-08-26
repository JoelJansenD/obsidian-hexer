import { hexKey } from "./HexerData";
import { RadialCoordinates, roundRadialCoordinates } from "./hexagon";

export type PathType = 'river' | 'road';

export interface PathNode extends RadialCoordinates { }
export function pathNodeEquals(a: PathNode | undefined | null, b: PathNode | undefined | null): boolean {
    return a?.q === b?.q && a?.r === b?.r;
}

export interface PathEdge {
    from: string; // hexKey of a node
    to: string;   // hexKey of a node
}

/**
 * A path (river or road) as a graph of nodes and undirected edges. `nodes` is a
 * plain keyed object rather than a Map so the in-memory shape equals the on-disk
 * shape — keys are `"q,r"` strings, so iteration preserves insertion order.
 */
export interface Path {
    id: string;
    name: string;
    nodes: Record<string, PathNode>;
    edges: PathEdge[];
    color: string;
    filePath: string | null;
}

/** A fresh, empty path with a generated id and the default colour. */
export function createPath(name: string): Path {
    return {
        id: crypto.randomUUID(),
        name,
        nodes: {},
        edges: [],
        color: '#ff0000',
        filePath: null,
    };
}

// Undirected: an edge between a and b is added once, and the endpoints are
// created as nodes if they do not exist yet.
export function addEdge(path: Path, a: RadialCoordinates, b: RadialCoordinates): void {
    const from = addNode(path, a);
    const to = addNode(path, b);
    if (from === to || hasEdge(path, a, b)) {
        return;
    }
    path.edges.push({ from, to });
}

export function addNode(path: Path, coordinates: RadialCoordinates): string {
    const key = hexKey(coordinates.q, coordinates.r);
    if (!(key in path.nodes)) {
        path.nodes[key] = { q: coordinates.q, r: coordinates.r };
    }
    return key;
}

// Returns the coordinates of every node directly connected to the given node.
export function getConnectedNodes(path: Path, coordinates: RadialCoordinates): PathNode[] {
    const key = hexKey(coordinates.q, coordinates.r);
    const neighbourKeys = path.edges
        .filter(edge => edge.from === key || edge.to === key)
        .map(edge => (edge.from === key ? edge.to : edge.from));

    return neighbourKeys
        .filter(neighbourKey => neighbourKey in path.nodes)
        .map(neighbourKey => ({ ...path.nodes[neighbourKey] }));
}

export function getCrossingEdgesAtCoordinates(path: Path, coordinates: RadialCoordinates): { edge: PathEdge, nodes: PathNode[] }[] {
    const key = hexKey(coordinates.q, coordinates.r);
    const result: { edge: PathEdge, nodes: PathNode[] }[] = [];
    path.edges.forEach(edge => {
        const fullPath = getFullEdgePath(path, edge);
        if (fullPath.some(node => hexKey(node.q, node.r) === key)) {
            result.push({ edge: edge, nodes: fullPath });
        }
    });
    return result;
}

export function getFullEdgePath(path: Path, edge: PathEdge): PathNode[] {
    const fromNode = path.nodes[edge.from];
    const toNode = path.nodes[edge.to];

    if (!fromNode || !toNode) {
        throw new Error(`Edge references non-existent node(s): ${edge.from}, ${edge.to}`);
    }

    // Walk the straight hex line between the endpoints: sample distance + 1
    // evenly spaced points along the line and round each to the nearest hex.
    const steps = getDistance(fromNode, toNode);
    const fullPath: PathNode[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const q = fromNode.q + (toNode.q - fromNode.q) * t;
        const r = fromNode.r + (toNode.r - fromNode.r) * t;
        fullPath.push(roundRadialCoordinates(q, r));
    }
    return fullPath;
}

export function getNode(path: Path, key: string): PathNode | undefined;
export function getNode(path: Path, coordinates: RadialCoordinates): PathNode | undefined;
export function getNode(path: Path, arg: string | RadialCoordinates): PathNode | undefined {
    const key = typeof (arg) === 'string' ? arg : hexKey(arg.q, arg.r);
    return path.nodes[key];
}

function getDistance(a: RadialCoordinates, b: RadialCoordinates): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

export function hasEdge(path: Path, a: RadialCoordinates, b: RadialCoordinates): boolean {
    const from = hexKey(a.q, a.r);
    const to = hexKey(b.q, b.r);
    return path.edges.some(edge => sameEdge(edge, from, to));
}

export function isEmpty(path: Path): boolean {
    return path.edges.length === 0 && Object.keys(path.nodes).length === 0;
}

/**
 * Moves a present node at oldCoordinates to newCoordinates.
 * @returns true if the move was successful, false if the node at oldCoordinates does not exist or if a node already exists at newCoordinates.
 */
export function moveNode(path: Path, oldCoordinates: RadialCoordinates, newCoordinates: RadialCoordinates): boolean {
    const oldKey = hexKey(oldCoordinates.q, oldCoordinates.r);
    const newKey = hexKey(newCoordinates.q, newCoordinates.r);

    if (oldKey === newKey) {
        return false;
    }

    if (!(oldKey in path.nodes)) {
        return false;
    }

    if (newKey in path.nodes) {
        return false;
    }

    delete path.nodes[oldKey];
    path.nodes[newKey] = { q: newCoordinates.q, r: newCoordinates.r };

    path.edges.forEach(edge => {
        if (edge.from === oldKey) {
            edge.from = newKey;
        }
        else if (edge.to === oldKey) {
            edge.to = newKey;
        }
    });

    return true;
}

export function removeEdge(path: Path, a: RadialCoordinates, b: RadialCoordinates): void {
    const from = hexKey(a.q, a.r);
    const to = hexKey(b.q, b.r);
    path.edges = path.edges.filter(edge => !sameEdge(edge, from, to));
}

// Removes the node and any edges that touch it.
export function removeNode(path: Path, coordinates: RadialCoordinates): void {
    const key = hexKey(coordinates.q, coordinates.r);
    delete path.nodes[key];
    path.edges = path.edges.filter(edge => edge.from !== key && edge.to !== key);
}

// Undirected comparison: (from, to) matches (to, from).
function sameEdge(edge: PathEdge, from: string, to: string): boolean {
    return (edge.from === from && edge.to === to)
        || (edge.from === to && edge.to === from);
}
