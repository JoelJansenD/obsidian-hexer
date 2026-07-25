import { Path, PathData } from "./path";

describe('Path', () => {

    let data: PathData;

    beforeEach(() => {
        data = {
            name: 'test',
            nodes: new Map([
                ['0,0', { q: 0, r: 0 }],
                ['1,0', { q: 1, r: 0 }],
            ]),
            edges: [ {
                from: '0,0',
                to: '1,0'
            } ]
        };
    });

    describe('constructor', () => {
        it('creates an empty graph when given a name', () => {
            // Act
            var path = new Path('test');

            // Assert
            expect(path.name).toBe('test');
            expect(path.isEmpty()).toBe(true);
        });

        it('loads a graph from a PathData object', () => {
            // Act
            var path = new Path(data);

            // Assert
            expect(path.name).toBe('test');
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.nodes.get('1,0')).toEqual({ q: 1, r: 0 });
            expect(path.edges).toEqual([{ from: '0,0', to: '1,0' }]);
        });
    });

    describe('addEdge', () => {
        it('doesn\'t add an edge if a node already exists', () => {
            // Arrange
            var existingNode = { q: 0, r: 0 };

            // Act
            var path = new Path('test');
            path.addNode(existingNode);
            path.addEdge(existingNode, { q: 1, r: 0 });
            path.addEdge(existingNode, { q: 1, r: 0 });

            // Assert
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.nodes.get('1,0')).toEqual({ q: 1, r: 0 });
            expect(path.edges.length).toBe(1);
            expect(path.edges.length).toBe(1);
        });

        it('doesn\'t add an edge if both nodes are the same', () => {
            // Arrange
            var node = { q: 0, r: 0 };

            // Act
            var path = new Path('test');
            path.addEdge(node, node);

            // Assert
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
            expect(path.edges.length).toBe(0);
        });
    });

    describe('addNode', () => {
        it('adds a node if it doesn\'t already exist', () => {
            // Arrange
            var node = { q: 0, r: 0 };
            var path = new Path('test');

            // Act
            path.addNode(node);

            // Assert
            expect(path.nodes.size).toBe(1);
            expect(path.nodes.get('0,0')).toEqual({ q: 0, r: 0 });
        });

        it('doesn\'t add a node if it already exists', () => {
            // Arrange
            var node = { q: 0, r: 0 };
            var path = new Path('test');
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
            var path = new Path(data);

            // Act
            var clone = path.clone();

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
            var path = new Path(data);

            // Act
            var neighbours = path.getConnectedNodes({ q: 0, r: 0 });

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 1, r: 0});
        });

        it('returns all nodes to which the target is invertedly connected', () => {
            // Arrange
            var path = new Path(data);

            // Act
            var neighbours = path.getConnectedNodes({q: 1, r: 0});

            // Assert
            expect(neighbours.length).toBe(1);
            expect(neighbours).toContainEqual({q: 0, r: 0});
        });
    });

    describe('hasEdge', () => {
        it('returns true if the edge exists', () => {
            // Arrange
            var path = new Path(data);

            // Act
            var result = path.hasEdge({ q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns true if the edge exists in reverse', () => {
            // Arrange
            var path = new Path(data);

            // Act
            var result = path.hasEdge({ q: 1, r: 0 }, { q: 0, r: 0 });

            // Assert
            expect(result).toBe(true);
        });

        it('returns false if the edge does not exist', () => {
            // Arrange
            var path = new Path(data);

            // Act
            var result = path.hasEdge({ q: 0, r: 0 }, { q: 2, r: 0 });

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

    describe('removeEdge', () => {
        it('removes an edge if it exists', () => {
            // Arrange
            var path = new Path(data);

            // Act
            path.removeEdge({ q: 0, r: 0 }, { q: 1, r: 0 });

            // Assert
            expect(path.edges.length).toBe(0);
        });

        it('does nothing if the edge does not exist', () => {
            // Arrange
            var path = new Path(data);

            // Act
            path.removeEdge({ q: 0, r: 0 }, { q: 2, r: 0 });

            // Assert
            expect(path.edges.length).toBe(1);
        });
    });

    describe('removeNode', () => {
        it('removes a node and its edges if it exists', () => {
            // Arrange
            var path = new Path(data);

            // Act
            path.removeNode({ q: 0, r: 0 });

            // Assert
            expect(path.nodes.get('0,0')).toBeUndefined();
            expect(path.edges.length).toBe(0);
        });

        it('does nothing if the node does not exist', () => {
            // Arrange
            var path = new Path(data);

            // Act
            path.removeNode({ q: 2, r: 0 });

            // Assert
            expect(path.nodes.size).toBe(2);
            expect(path.edges.length).toBe(1);
        });

        it('removes no edges if the node has no edges', () => {
            // Arrange
            var path = new Path(data);
            path.addNode({ q: 2, r: 0 });

            // Act
            path.removeNode({ q: 2, r: 0 });

            // Assert
            expect(path.nodes.get('2,0')).toBeUndefined();
            expect(path.edges.length).toBe(1);
        });
    });
});