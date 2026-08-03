import { hexKey } from "./HexerData";
import PriorityQueue from "./PriorityQueue";
import { getNeighbours, RadialCoordinates } from "./hexagon";

export type PathType = 'river' | 'road';

export interface PathNode extends RadialCoordinates { }

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
}

export class Path implements PathData {
    public id: string;
    public name: string;
    public nodes: PathNodeMap;
    public edges: PathEdge[];

    constructor(name: string);
    constructor(state: PathData);
    constructor(arg: string | PathData) {
        if (typeof arg === 'string') {
            this.id = crypto.randomUUID();
            this.name = arg;
            this.nodes = new Map();
            this.edges = [];
            return;
        }

        this.id = arg.id;
        this.name = arg.name;
        this.nodes = arg.nodes;
        this.edges = arg.edges ?? [];
    }

    // Undirected: an edge between a and b is added once, and the endpoints are
    // created as nodes if they do not exist yet.
    public addEdge(a: RadialCoordinates, b: RadialCoordinates): void {
        const from = this.addNode(a);
        const to = this.addNode(b);
        if (from === to || this.hasEdge(a, b)) {
            return;
        }
        this.edges.push({ from, to });
    }

    public addNode(coordinates: RadialCoordinates): string {
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
        return new Path({ id: this.id, name: this.name, nodes, edges });
    }

    // Returns the coordinates of every node directly connected to the given node.
    public getConnectedNodes(coordinates: RadialCoordinates): PathNode[] {
        const key = hexKey(coordinates.q, coordinates.r);
        const neighbourKeys = this.edges
            .filter(edge => edge.from === key || edge.to === key)
            .map(edge => (edge.from === key ? edge.to : edge.from));

        return neighbourKeys
            .map(neighbourKey => ({... this.nodes.get(neighbourKey)}))
            .filter((node): node is PathNode => node !== undefined);
    }

    public getFullEdgePath(edge: PathEdge): PathNode[] {
        const fromNode = this.nodes.get(edge.from);
        const toNode = this.nodes.get(edge.to);

        if(!fromNode || !toNode) {
            throw new Error(`Edge references non-existent node(s): ${edge.from}, ${edge.to}`);
        }

        const startKey = hexKey(fromNode.q, fromNode.r);
        const goalKey = hexKey(toNode.q, toNode.r);

        const frontier = new PriorityQueue<PathNode>();
        frontier.enqueue(fromNode, 0);

        // visited: key of a node -> the node we reached it from.
        // The start marks itself so it is never re-enqueued.
        const visited: Map<string, PathNode> = new Map();
        visited.set(startKey, fromNode);

        while(!frontier.isEmpty()) {
            const { item: currentNode } = frontier.dequeue();
            if(hexKey(currentNode.q, currentNode.r) === goalKey) {
                break;
            }

            const neighbours = getNeighbours(currentNode);
            for(const next of neighbours) {
                const key = hexKey(next.q, next.r);
                if(!visited.has(key)) {
                    frontier.enqueue(next, this.getDistance(next, toNode));
                    visited.set(key, currentNode);
                }
            }
        }

        return this.reconstructPath(visited, startKey, goalKey, toNode);
    }

    public getNode(coordinates: RadialCoordinates): PathNode | undefined {
        const key = hexKey(coordinates.q, coordinates.r);
        return this.nodes.get(key);
    }

    // Walks the visited (came-from) map backwards from the goal to the start,
    // then reverses so the result reads start -> goal. Returns an empty array
    // if the goal was never reached.
    private reconstructPath(
        cameFrom: Map<string, PathNode>,
        startKey: string,
        goalKey: string,
        goal: PathNode,
    ): PathNode[] {
        if(!cameFrom.has(goalKey)) {
            return [];
        }

        const path: PathNode[] = [];
        let current: PathNode | undefined = goal;

        while(current) {
            const currentKey = hexKey(current.q, current.r);
            path.push(current);
            if(currentKey === startKey) {
                break;
            }
            current = cameFrom.get(currentKey);
        }

        return path.reverse();
    }

    private getDistance(a: RadialCoordinates, b: RadialCoordinates): number {
        return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
    }

    public hasEdge(a: RadialCoordinates, b: RadialCoordinates): boolean {
        const from = hexKey(a.q, a.r);
        const to = hexKey(b.q, b.r);
        return this.edges.some(edge => sameEdge(edge, from, to));
    }

    public isEmpty(): boolean {
        return this.edges.length === 0 && this.nodes.size === 0;
    }

    public removeEdge(a: RadialCoordinates, b: RadialCoordinates): void {
        const from = hexKey(a.q, a.r);
        const to = hexKey(b.q, b.r);
        this.edges = this.edges.filter(edge => !sameEdge(edge, from, to));
    }

    // Removes the node and any edges that touch it.
    public removeNode(coordinates: RadialCoordinates): void {
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
