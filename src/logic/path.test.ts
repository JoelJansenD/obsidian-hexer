import {
    Path,
    addEdge,
    addNode,
    createPath,
    getConnectedNodes,
    getCrossingEdgesAtCoordinates,
    getFullEdgePath,
    getNode,
    hasEdge,
    isEmpty,
    moveNode,
    removeEdge,
    removeNode,
} from "./path";

describe('Path', () => {

    let data: Path;

    beforeEach(() => {
        data = {
            id: 'test-id',
            name: 'test',
            nodes: {
                '0,0': { q: 0, r: 0 },
                '1,0': { q: 1, r: 0 },
            },
            edges: [ {
                from: '0,0',
                to: '1,0'
            } ],
            color: '#ff0000',
            filePath: null
        };
    });

    describe('createPath', () => {
        it('creates an empty graph with the given name', () => {
            // Act
            const path = createPath('test');

            // Assert
            expect(path.name).toBe('test');
            expect(isEmpty(path)).toBe(true);
        });
    });

    describe('addEdge', () => {
        it('doesn\'t add a duplicate edge if a node already exists', () => {
            // Arrange
            const existingNode = { q: 0, r: 0 };

            // Act
            const path = createPath('test');
            addNode(path, existingNode);
            addEdge(path, existingNode, { q: 1, r: 0 });
            addEdge(path, existingNode, { q: 1, r: 0 });

            // Assert
            expect(path.nodes['0,0']).toEqual({ q: 0, r: 0 });
            expect(path.nodes['1,0']).toEqual({ q: 1, r: 0 });
            expect(path.edges.length).toBe(1);
        });

        it('doesn\'t add an edge if both nodes are the same', () => {
            // Arrange
            const node = { q: 0, r: 0 };

            // Act
            const path = createPath('test');
            addEdge(path, node, node);

            // Assert
            expect(path.nodes['0,0']).toEqual({ q: 0, r: 0 });
            expect(path.edges.length).toBe(0);
        });
    });

    describe('addNode', () => {
        it('adds a node if it doesn\'t already exist', () => {
            // Arrange
            const node = { q: 0, r: 0 };
            const path = createPath('test');

            // Act
            addNode(path, node);

            // Assert
            expect(Object.keys(path.nodes).length).toBe(1);
            expect(path.nodes['0,0']).toEqual({ q: 0, r: 0 });
        });

        it('doesn\'t add a node if it already exists', () => {
            // Arrange
            const node = { q: 0, r: 0 };
            const path = createPath('test');
            addNode(path, node);

            // Act
            addNode(path, node);

            // Assert
            expect(Object.keys(path.nodes).length).toBe(1);
            expect(path.nodes['0,0']).toEqual({ q: 0, r: 0 });
        });
    });

    describe('getConnectedNodes', () => {
        it('returns all nodes to which the target is connected', () => {
            // Act
            const neighbours = getConnectedNodes(data, { q: 0, r: 0 });

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 1, r: 0});
        });

        it('returns all nodes to which the target is invertedly connected', () => {
            // Act
            const neighbours = getConnectedNodes(data, {q: 1, r: 0});

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 0, r: 0});
        });
    });

    describe('getCrossingEdgesAtCoordinates', () => {
        it('returns all edges that cross the given coordinates', () => {
            // Arrange
            const path = createPath('Crossing test');
            addEdge(path, { q: 0, r: 0 }, { q: 2, r: 0 });
            addEdge(path, { q: 2, r: 0}, { q: 2, r: 2 });

            // Act
            const crossingEdges = getCrossingEdgesAtCoordinates(path, { q: 1, r: 0 });

            // Assert
            expect(crossingEdges.length).toBe(1);
            expect(crossingEdges[0].edge).toEqual({ from: '0,0', to: '2,0' });
        });
    });

    describe('getFullEdgePath', () => {
        it('returns both endpoints for an edge between neighbours', () => {
            // Arrange
            const path = createPath('Neighbours');
            addEdge(path, { q: 0, r: 0 }, { q: 1, r: 0 });

            // Act
            const fullPath = getFullEdgePath(path, path.edges[0]);

            // Assert
            expect(fullPath).toEqual([
                { q: 0, r: 0 },
                { q: 1, r: 0 }
            ]);
        });

        it('fills in every hex between the endpoints', () => {
            // Arrange
            const path = createPath('Straight');
            addEdge(path, { q: 0, r: 0 }, { q: 3, r: 0 });

            // Act
            const fullPath = getFullEdgePath(path, path.edges[0]);

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
            const path = createPath('Diagonal');
            addEdge(path, { q: 0, r: 0 }, { q: 2, r: 1 });

            // Act
            const fullPath = getFullEdgePath(path, path.edges[0]);

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
            const path = createPath('Reversed');
            addEdge(path, { q: 3, r: 0 }, { q: 0, r: 0 });

            // Act
            const fullPath = getFullEdgePath(path, path.edges[0]);

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
            const path = createPath('Self');
            addNode(path, { q: 0, r: 0 });
            path.edges.push({ from: '0,0', to: '0,0' });

            // Act
            const fullPath = getFullEdgePath(path, path.edges[0]);

            // Assert
            expect(fullPath).toEqual([{ q: 0, r: 0 }]);
        });

        it('throws if the edge references a node that does not exist', () => {
            // Arrange
            const path = createPath('Dangling');
            addNode(path, { q: 0, r: 0 });
            path.edges.push({ from: '0,0', to: '1,0' });

            // Act & Assert
            expect(() => {
                getFullEdgePath(path, path.edges[0]);
            }).toThrow('Edge references non-existent node(s): 0,0, 1,0');
        });
    });

    describe('getNode', () => {
        it('returns the node if it exists', () => {
            // Act
            const node = getNode(data, { q: 0, r: 0 });

            // Assert
            expect(node).toEqual({ q: 0, r: 0 });
        });

        it('returns undefined if the node does not exist', () => {
            // Act
            const node = getNode(data, { q: 2, r: 0 });

            // Assert
            expect(node).toBeUndefined();
        });
    });

    describe('hasEdge', () => {
        it('returns true if the edge exists', () => {
            // Act
            const result = hasEdge(data, { q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns true if the edge exists in reverse', () => {
            // Act
            const result = hasEdge(data, { q: 1, r: 0 }, { q: 0, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns false if the edge does not exist', () => {
            // Act
            const result = hasEdge(data, { q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('isEmpty', () => {
        it('return true if the path has no nodes and edges', () => {
            // Arrange
            const path = createPath("test");

            // Act
            const result = isEmpty(path);

            // Assert
            expect(result).toBe(true);
        });

        it('return false if the path has nodes', () => {
            // Arrange
            const path = createPath("test");
            addNode(path, {q: 0, r: 0});

            // Act
            const result = isEmpty(path);

            // Assert
            expect(result).toBe(false);
        });

        it('return false if the path has edges', () => {
            // Act
            const result = isEmpty(data);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('moveNode', () => {
        it('moves a node if it exists and the new coordinates are free', () => {
            // Act
            const result = moveNode(data, { q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(true);
            expect(data.nodes['0,0']).toBeUndefined();
            expect(data.nodes['2,0']).toEqual({ q: 2, r: 0 });
            expect(data.edges[0]).toEqual({ from: '2,0', to: '1,0' });
        });

        it('does not move a node if it does not exist', () => {
            // Act
            const result = moveNode(data, { q: 2, r: 0 }, { q: 3, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(data.nodes['2,0']).toBeUndefined();
            expect(data.nodes['3,0']).toBeUndefined();
        });

        it('does not move a node if the new coordinates are already occupied', () => {
            // Arrange
            addNode(data, { q: 2, r: 0 });

            // Act
            const result = moveNode(data, { q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(data.nodes['0,0']).toEqual({ q: 0, r: 0 });
            expect(data.nodes['2,0']).toEqual({ q: 2, r: 0 });
        });

        it('does not move a node if the new coordinates are the same as the old coordinates', () => {
            // Act
            const result = moveNode(data, { q: 0, r: 0 }, { q: 0, r: 0 });

            // Assert
            expect(result).toBe(false);
            expect(data.nodes['0,0']).toEqual({ q: 0, r: 0 });
        });
    });

    describe('removeEdge', () => {
        it('removes an edge if it exists', () => {
            // Act
            removeEdge(data, { q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(data.edges.length).toBe(0);
        });

        it('does nothing if the edge does not exist', () => {
            // Act
            removeEdge(data, { q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(data.edges.length).toBe(1);
        });
    });

    describe('removeNode', () => {
        it('removes a node and its edges if it exists', () => {
            // Act
            removeNode(data, { q: 0, r: 0 });

            // Assert
            expect(data.nodes['0,0']).toBeUndefined();
            expect(data.edges.length).toBe(0);
        });

        it('does nothing if the node does not exist', () => {
            // Act
            removeNode(data, { q: 2, r: 0 });

            // Assert
            expect(Object.keys(data.nodes).length).toBe(2);
            expect(data.edges.length).toBe(1);
        });

        it('removes no edges if the node has no edges', () => {
            // Arrange
            addNode(data, { q: 2, r: 0 });

            // Act
            removeNode(data, { q: 2, r: 0 });

            // Assert
            expect(data.nodes['2,0']).toBeUndefined();
            expect(data.edges.length).toBe(1);
        });
    });
});
