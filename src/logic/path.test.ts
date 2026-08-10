import { Path, PathData } from "./path";

describe('Path', () => {

    let data: PathData;

    beforeEach(() => {
        data = {
            id: 'test-id',
            name: 'test',
            nodes: new Map([
                ['0,0', { q: 0, r: 0 }],
                ['1,0', { q: 1, r: 0 }],
            ]),
            edges: [ {
                from: '0,0',
                to: '1,0'
            } ],
            color: '#ff0000',
            filePath: null
        };
    });

    describe('constructor', () => {
        it('creates an empty graph when given a name', () => {
            // Act
            const path = new Path('test');

            // Assert
            expect(path.name).toBe('test');
            expect(path.isEmpty()).toBe(true);
        });

        it('loads a graph from a PathData object', () => {
            // Act
            const path = new Path(data);

            // Assert
            expect(path.name).toBe('test');
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.nodes.get('1,0')).toEqual({ q: 1, r: 0 });
            expect(path.edges).toEqual([{ from: '0,0', to: '1,0' }]);
        });
    });

    describe('addEdge', () => {
        it('doesn\'t add a duplicate edge if a node already exists', () => {
            // Arrange
            const existingNode = { q: 0, r: 0 };

            // Act
            const path = new Path('test');
            path.addNode(existingNode);
            path.addEdge(existingNode, { q: 1, r: 0 });
            path.addEdge(existingNode, { q: 1, r: 0 });

            // Assert
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.nodes.get('1,0')).toEqual({ q: 1, r: 0 });
            expect(path.edges.length).toBe(1);
        });

        it('doesn\'t add an edge if both nodes are the same', () => {
            // Arrange
            const node = { q: 0, r: 0 };

            // Act
            const path = new Path('test');
            path.addEdge(node, node);

            // Assert
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.edges.length).toBe(0);
        });
    });

    describe('addNode', () => {
        it('adds a node if it doesn\'t already exist', () => {
            // Arrange
            const node = { q: 0, r: 0 };
            const path = new Path('test');

            // Act
            path.addNode(node);

            // Assert
            expect(path.nodes.size).toBe(1);
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
        });

        it('doesn\'t add a node if it already exists', () => {
            // Arrange
            const node = { q: 0, r: 0 };
            const path = new Path('test');
            path.addNode(node);

            // Act
            path.addNode(node);

            // Assert
            expect(path.nodes.size).toBe(1);
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
        });
    });

    describe('clone', () => {
        it('creates a deep clone', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const clone = path.clone();

            // Assert
            expect(clone).toEqual(path);
            expect(clone.nodes).toEqual(path.nodes);
            expect(clone.edges).toEqual(path.edges);
            expect(clone).not.toBe(path);
            expect(clone.nodes).not.toBe(path.nodes);
            expect(clone.edges).not.toBe(path.edges);
        });
    });

    describe('getConnectedNodes', () => {
        it('returns all nodes to which the target is connected', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const neighbours = path.getConnectedNodes({ q: 0, r: 0 });

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 1, r: 0});
        });

        it('returns all nodes to which the target is invertedly connected', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const neighbours = path.getConnectedNodes({q: 1, r: 0});

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 0, r: 0});
        });
    });

    describe('getCrossingEdgesAtCoordinates', () => {
        it('returns all edges that cross the given coordinates', () => {
            // Arrange
            const path = new Path('Crossing test');
            path.addEdge({ q: 0, r: 0 }, { q: 2, r: 0 });
            path.addEdge({ q: 2, r: 0}, { q: 2, r: 2 });

            // Act
            const crossingEdges = path.getCrossingEdgesAtCoordinates({ q: 1, r: 0 });

            // Assert
            expect(crossingEdges.length).toBe(1);
            expect(crossingEdges[0].edge).toEqual({ from: '0,0', to: '2,0' });
        });
    });

    describe('getFullEdgePath', () => {
        it('returns both endpoints for an edge between neighbours', () => {
            // Arrange
            const path = new Path('Neighbours');
            path.addEdge({ q: 0, r: 0 }, { q: 1, r: 0 });

            // Act
            const fullPath = path.getFullEdgePath(path.edges[0]);

            // Assert
            expect(fullPath).toEqual([
                { q: 0, r: 0 },
                { q: 1, r: 0 }
            ]);
        });

        it('fills in every hex between the endpoints', () => {
            // Arrange
            const path = new Path('Straight');
            path.addEdge({ q: 0, r: 0 }, { q: 3, r: 0 });

            // Act
            const fullPath = path.getFullEdgePath(path.edges[0]);

            // Assert
            expect(fullPath).toEqual([
                { q: 0, r: 0 },
                { q: 1, r: 0 },
                { q: 2, r: 0 },
                { q: 3, r: 0 }
            ]);
        });

        it('rounds to a contiguous run of hexes when the line is not axis aligned', () => {
            // Arrange
            const path = new Path('Diagonal');
            path.addEdge({ q: 0, r: 0 }, { q: 2, r: 1 });

            // Act
            const fullPath = path.getFullEdgePath(path.edges[0]);

            // Assert
            expect(fullPath).toEqual([
                { q: 0, r: 0 },
                { q: 1, r: 0 },
                { q: 1, r: 1 },
                { q: 2, r: 1 }
            ]);
        });

        it('walks the path in the direction the edge is stored', () => {
            // Arrange
            const path = new Path('Reversed');
            path.addEdge({ q: 3, r: 0 }, { q: 0, r: 0 });

            // Act
            const fullPath = path.getFullEdgePath(path.edges[0]);

            // Assert
            expect(fullPath).toEqual([
                { q: 3, r: 0 },
                { q: 2, r: 0 },
                { q: 1, r: 0 },
                { q: 0, r: 0 }
            ]);
        });

        it('returns a single hex when both endpoints are the same node', () => {
            // Arrange
            // addEdge rejects self-edges, so the edge is added directly.
            const path = new Path('Self');
            path.addNode({ q: 0, r: 0 });
            path.edges.push({ from: '0,0', to: '0,0' });

            // Act
            const fullPath = path.getFullEdgePath(path.edges[0]);

            // Assert
            expect(fullPath).toEqual([{ q: 0, r: 0 }]);
        });

        it('throws if the edge references a node that does not exist', () => {
            // Arrange
            const path = new Path('Dangling');
            path.addNode({ q: 0, r: 0 });
            path.edges.push({ from: '0,0', to: '1,0' });

            // Act & Assert
            expect(() => {
                path.getFullEdgePath(path.edges[0]);
            }).toThrow('Edge references non-existent node(s): 0,0, 1,0');
        });
    });

    describe('getNode', () => {
        it('returns the node if it exists', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const node = path.getNode({ q: 0, r: 0 });

            // Assert
            expect(node).toEqual({ q: 0, r: 0 });
        });

        it('returns undefined if the node does not exist', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const node = path.getNode({ q: 2, r: 0 });

            // Assert
            expect(node).toBeUndefined();
        });
    });

    describe('hasEdge', () => {
        it('returns true if the edge exists', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.hasEdge({ q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns true if the edge exists in reverse', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.hasEdge({ q: 1, r: 0 }, { q: 0, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns false if the edge does not exist', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.hasEdge({ q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('isEmpty', () => {
        it('return true if the path has no nodes and edges', () => {
            // Arrange
            const path = new Path("test");

            // Act
            const result = path.isEmpty();

            // Assert
            expect(result).toBe(true);
        });
        
        it('return false if the path has nodes', () => {
            // Arrange
            const path = new Path("test");
            path.addNode({q: 0, r: 0});

            // Act
            const result = path.isEmpty();

            // Assert
            expect(result).toBe(false);
        });
        
        it('return false if the path has edges', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.isEmpty();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('moveNode', () => {
        it('moves a node if it exists and the new coordinates are free', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.moveNode({ q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(true);
            expect(path.nodes.get('0,0')).toBeUndefined();
            expect(path.nodes.get('2,0')).toEqual({ q: 2, r: 0 });
            expect(path.edges[0]).toEqual({ from: '2,0', to: '1,0' });
        });

        it('does not move a node if it does not exist', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.moveNode({ q: 2, r: 0 }, { q: 3, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(path.nodes.get('2,0')).toBeUndefined();
            expect(path.nodes.get('3,0')).toBeUndefined();
        });

        it('does not move a node if the new coordinates are already occupied', () => {
            // Arrange
            const path = new Path(data);
            path.addNode({ q: 2, r: 0 });

            // Act
            const result = path.moveNode({ q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.nodes.get('2,0')).toEqual({ q: 2, r: 0 });
        });

        it('does not move a node if the new coordinates are the same as the old coordinates', () => {
            // Arrange
            const path = new Path(data);

            // Act
            const result = path.moveNode({ q: 0, r: 0 }, { q: 0, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
        });
    });

    describe('removeEdge', () => {
        it('removes an edge if it exists', () => {
            // Arrange
            const path = new Path(data);

            // Act
            path.removeEdge({ q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(path.edges.length).toBe(0);
        });

        it('does nothing if the edge does not exist', () => {
            // Arrange
            const path = new Path(data);

            // Act
            path.removeEdge({ q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(path.edges.length).toBe(1);
        });
    });

    describe('removeNode', () => {
        it('removes a node and its edges if it exists', () => {
            // Arrange
            const path = new Path(data);

            // Act
            path.removeNode({ q: 0, r: 0 });

            // Assert
            expect(path.nodes.get('0,0')).toBeUndefined();
            expect(path.edges.length).toBe(0);
        });

        it('does nothing if the node does not exist', () => {
            // Arrange
            const path = new Path(data);

            // Act
            path.removeNode({ q: 2, r: 0 });

            // Assert
            expect(path.nodes.size).toBe(2);
            expect(path.edges.length).toBe(1);
        });

        it('removes no edges if the node has no edges', () => {
            // Arrange
            const path = new Path(data);
            path.addNode({ q: 2, r: 0 });

            // Act
            path.removeNode({ q: 2, r: 0 });

            // Assert
            expect(path.nodes.get('2,0')).toBeUndefined();
            expect(path.edges.length).toBe(1);
        });
    });
});
