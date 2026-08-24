import { hexKey } from "./HexerData";
import { AxialCoordinates, roundAxialCoordinates } from "./hexagon";

export interface PathNode extends AxialCoordinates { }
export function pathNodeEquals(a: PathNode | undefined | null, b: PathNode | undefined | null): boolean {
    return a?.q === b?.q && a?.r === b?.r;
}

export interface PathEdge {
    from: string; // hexKey of a node
    to: string;   // hexKey of a node
}

export type PathNodeMap = Map<string, PathNode>;

export interface PathData {
    id: string;
    name: string;
    nodes: PathNodeMap;
    edges: PathEdge[];
    color: string;
    filePath: string | null;
}

export class Path implements PathData {
    public id: string;
    public name: string;
    public nodes: PathNodeMap;
    public edges: PathEdge[];
    public color: string;
    public filePath: string | null;

    constructor(name: string);
    constructor(state: PathData);
    constructor(arg: string | PathData) {
        if (typeof arg === 'string') {
            this.id = crypto.randomUUID();
            this.name = arg;
            this.nodes = new Map();
            this.edges = [];
            this.color = '#ff0000';
            this.filePath = null;
            return;
        }

        this.id = arg.id;
        this.name = arg.name;
        this.nodes = arg.nodes;
        this.edges = arg.edges ?? [];
        this.color = arg.color;
        this.filePath = arg.filePath;
    }

    // Undirected: an edge between a and b is added once, and the endpoints are
    // created as nodes if they do not exist yet.
    public addEdge(a: AxialCoordinates, b: AxialCoordinates): void {
        const from = this.addNode(a);
        const to = this.addNode(b);
        if (from === to || this.hasEdge(a, b)) {
            return;
        }
        this.edges.push({ from, to });
    }

    public addNode(coordinates: AxialCoordinates): string {
        const key = hexKey(coordinates.q, coordinates.r);
        if (!this.nodes.has(key)) {
            this.nodes.set(key, { q: coordinates.q, r: coordinates.r });
        }
        return key;
    }

    public clone(): Path {
        const nodes: PathNodeMap = new Map();
        for (const [key, node] of this.nodes) {
            nodes.set(key, { ...node });
        }
        const edges = this.edges.map(edge => ({ ...edge }));
        return new Path({ id: this.id, name: this.name, nodes, edges, color: this.color, filePath: this.filePath });
    }

    // Returns the coordinates of every node directly connected to the given node.
    public getConnectedNodes(coordinates: AxialCoordinates): PathNode[] {
        const key = hexKey(coordinates.q, coordinates.r);
        const neighbourKeys = this.edges
            .filter(edge => edge.from === key || edge.to === key)
            .map(edge => (edge.from === key ? edge.to : edge.from));

        return neighbourKeys
            .filter(neighbourKey => this.nodes.has(neighbourKey))
            .map(neighbourKey => ({... this.nodes.get(neighbourKey)}))
            .filter((node): node is PathNode => node !== undefined);
    }

    public getCrossingEdgesAtCoordinates(coordinates: AxialCoordinates): { edge: PathEdge, nodes: PathNode[] }[] {
        const key = hexKey(coordinates.q, coordinates.r);
        const result: { edge: PathEdge, nodes: PathNode[] }[] = [];
        this.edges.forEach(edge => {
            const fullPath = this.getFullEdgePath(edge);
            if (fullPath.some(node => hexKey(node.q, node.r) === key)) {
                result.push({edge: edge, nodes: fullPath});
            }
        });
        return result;
    }

    public getFullEdgePath(edge: PathEdge): PathNode[] {
        const fromNode = this.nodes.get(edge.from);
        const toNode = this.nodes.get(edge.to);

        if(!fromNode || !toNode) {
            throw new Error(`Edge references non-existent node(s): ${edge.from}, ${edge.to}`);
        }

        // Walk the straight hex line between the endpoints: sample distance + 1
        // evenly spaced points along the line and round each to the nearest hex.
        const steps = this.getDistance(fromNode, toNode);
        const path: PathNode[] = [];
        for(let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 0 : i / steps;
            const q = fromNode.q + (toNode.q - fromNode.q) * t;
            const r = fromNode.r + (toNode.r - fromNode.r) * t;
            path.push(roundAxialCoordinates(q, r));
        }
        return path;
    }

    public getNode(key: string): PathNode | undefined;
    public getNode(coordinates: AxialCoordinates): PathNode | undefined;
    public getNode(arg: string | AxialCoordinates): PathNode | undefined {
        const key = typeof(arg) === 'string' ? arg : hexKey(arg.q, arg.r);
        return this.nodes.get(key);
    }

    private getDistance(a: AxialCoordinates, b: AxialCoordinates): number {
        return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
    }

    public hasEdge(a: AxialCoordinates, b: AxialCoordinates): boolean {
        const from = hexKey(a.q, a.r);
        const to = hexKey(b.q, b.r);
        return this.edges.some(edge => sameEdge(edge, from, to));
    }

    public isEmpty(): boolean {
        return this.edges.length === 0 && this.nodes.size === 0;
    }

    /**
     * Moves a present node at oldCoordinates to newCoordinates.
     * @returns true if the move was successful, false if the node at oldCoordinates does not exist or if a node already exists at newCoordinates.
     */
    public moveNode(oldCoordinates: AxialCoordinates, newCoordinates: AxialCoordinates): boolean {
        const oldKey = hexKey(oldCoordinates.q, oldCoordinates.r);
        const newKey = hexKey(newCoordinates.q, newCoordinates.r);

        if(oldKey === newKey) {
            return false;
        }

        if (!this.nodes.has(oldKey)) {
            return false;
        }

        if(this.nodes.has(newKey)) {
            return false;
        }

        this.nodes.delete(oldKey);
        this.nodes.set(newKey, { q: newCoordinates.q, r: newCoordinates.r });

        this.edges.forEach(edge => {
            if (edge.from === oldKey) {
                edge.from = newKey;
            } 
            else if (edge.to === oldKey) {
                edge.to = newKey;
            }
        });

        return true;
    }

    public removeEdge(a: AxialCoordinates, b: AxialCoordinates): void {
        const from = hexKey(a.q, a.r);
        const to = hexKey(b.q, b.r);
        this.edges = this.edges.filter(edge => !sameEdge(edge, from, to));
    }

    // Removes the node and any edges that touch it.
    public removeNode(coordinates: AxialCoordinates): void {
        const key = hexKey(coordinates.q, coordinates.r);
        this.nodes.delete(key);
        this.edges = this.edges.filter(edge => edge.from !== key && edge.to !== key);
    }
}

// Undirected comparison: (from, to) matches (to, from).
function sameEdge(edge: PathEdge, from: string, to: string): boolean {
    return (edge.from === from && edge.to === to)
        || (edge.from === to && edge.to === from);
}
