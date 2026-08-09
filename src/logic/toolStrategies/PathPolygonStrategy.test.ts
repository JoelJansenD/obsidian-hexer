import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { HexerData, hexKey } from "../HexerData";
import { Path } from "../path";
import PathPolygonStrategy from "./PathPolygonStrategy";

describe('onLeftClick', () => {

    let defaultHexerData: HexerData;
    let targetPath: Path;
    let strategyToTest: PathPolygonStrategy;
    
    beforeEach(() => {
        targetPath = new Path('Empty river');
        defaultHexerData = createHexerData();
        defaultHexerData.rivers.push(targetPath);

        strategyToTest = new PathPolygonStrategy();
    });

    it('does not make changes to a path when no path is active', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: null};
        const data = defaultHexerData.clone();

        // Act
        strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});

        // Assert
        expect(data).toEqual(defaultHexerData);
    });

    it('throws an exception if the active path is not found in the data', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: { pathId: new Path('Nonexistent path').id, activeNode: null } };
        const data = defaultHexerData.clone();

        // Act & Assert
        expect(() => {
            strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});
        }).toThrow(`Active path with id ${editorState.activePath.pathId} not found in data.`);
    });

    it('adds a node to the active path when a path is active and marks it as active', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: null } };
        const data = defaultHexerData.clone();

        // Act
        strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.size).toBe(1);
        expect(river.nodes.has('0,0')).toBe(true);
        expect(editorState.activePath.activeNode).toEqual({q: 0, r: 0});
    });

    it('adds and selectes a node when another node is already active and adds an edge between them', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: null } };
        const data = defaultHexerData.clone();
        strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});

        // Act
        strategyToTest.onLeftClick(data, editorState, {q: 1, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.size).toBe(2);
        expect(river.nodes.has('0,0')).toBe(true);
        expect(river.nodes.has('1,0')).toBe(true);
        expect(editorState.activePath.activeNode).toEqual({q: 1, r: 0});
        expect(river.hasEdge({q: 1, r: 0}, {q: 0, r: 0})).toBe(true);
    });

    it('splits a path into two when a node is added that already exists in the path', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: null } };
        const data = defaultHexerData.clone();
        strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});
        strategyToTest.onLeftClick(data, editorState, {q: 5, r: 0});

        // Act
        strategyToTest.onLeftClick(data, editorState, {q: 2, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.size).toBe(3);
        expect(river.nodes.has('0,0')).toBe(true);
        expect(river.nodes.has('5,0')).toBe(true);
        expect(river.nodes.has('2,0')).toBe(true);
        expect(editorState.activePath.activeNode).toEqual({q: 2, r: 0});
        expect(river.hasEdge({q: 0, r: 0}, {q: 5, r: 0})).toBe(false);
        expect(river.hasEdge({q: 2, r: 0}, {q: 5, r: 0})).toBe(true);
        expect(river.hasEdge({q: 2, r: 0}, {q: 0, r: 0})).toBe(true);
    });

});

describe('onDoubleLeftClick', () => {
    it('connects two existing nodes on double-click', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addNode({q: 0, r: 0});
        targetPath.addNode({q: 1, r: 0});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: {q: 1, r: 0} } };
        
        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();
        strategyToTest['previousNode'] = {q: 0, r: 0};

        // Act
        strategyToTest.onLeftDoubleClick(data, editorState, {q: 1, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.hasEdge({q: 0, r: 0}, {q: 1, r: 0})).toBe(true);
    });
    
    it('does not do anything if there is no active path', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: null };
        const data = createHexerData();
        data.rivers.push(new Path('Empty river'));
        const strategyToTest = new PathPolygonStrategy();

        // Act
        strategyToTest.onLeftDoubleClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.edges.length).toBe(0);
    });
    
    it('does not do anything if there is no active node', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: null } };
        const data = createHexerData();
        data.rivers.push(targetPath);
        const strategyToTest = new PathPolygonStrategy();

        // Act
        strategyToTest.onLeftDoubleClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.edges.length).toBe(0);
    });
    
    it('does not do anything if the same node is clicked', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addNode({q: 0, r: 0});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: {q: 0, r: 0} } };

        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();
        strategyToTest['previousNode'] = {q: 0, r: 0};

        // Act
        strategyToTest.onLeftDoubleClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.edges).not.toContainEqual({ from: {q: 0, r: 0}, to: {q: 0, r: 0} })
    });
});

describe('onRightClick', () => {
    it('removes the right-clicked node and every edge attached to it', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addEdge({q: 0, r: 0}, {q: 1, r: 0});
        targetPath.addEdge({q: 1, r: 0}, {q: 1, r: 1});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: {q: 1, r: 0} } };

        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();

        // Act
        strategyToTest.onRightClick(data, editorState, {q: 1, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.has(hexKey(1, 0))).toBe(false);
        expect(river.hasEdge({q: 0, r: 0}, {q: 1, r: 0})).toBe(false);
        expect(river.hasEdge({q: 1, r: 0}, {q: 1, r: 1})).toBe(false);
    });

    it('does nothing if the right-clicked node does not exist in the active path', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addEdge({q: 0, r: 0}, {q: 1, r: 0});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: null } };
        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();

        // Act
        strategyToTest.onRightClick(data, editorState, {q: 2, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.has(hexKey(0, 0))).toBe(true);
        expect(river.nodes.has(hexKey(1, 0))).toBe(true);
        expect(river.hasEdge({q: 0, r: 0}, {q: 1, r: 0})).toBe(true);
    });
        

    it('does not resurrect the removed node on the next left click when it was the active node', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addEdge({q: 0, r: 0}, {q: 1, r: 0});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: {q: 1, r: 0} } };

        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();

        // Act
        strategyToTest.onRightClick(data, editorState, {q: 1, r: 0});
        strategyToTest.onLeftClick(data, editorState, {q: 2, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.has(hexKey(1, 0))).toBe(false);
        expect(river.hasEdge({q: 1, r: 0}, {q: 2, r: 0})).toBe(false);
    });

    it('does not resurrect the removed node on a following double-click when it was the previous node', () => {
        // Arrange
        const targetPath = new Path('Empty river');
        targetPath.addEdge({q: 0, r: 0}, {q: 1, r: 0});
        const editorState = {...defaultEditorState, activePath: { pathId: targetPath.id, activeNode: {q: 0, r: 0} } };

        const data = createHexerData();
        data.rivers.push(targetPath);

        const strategyToTest = new PathPolygonStrategy();
        strategyToTest['previousNode'] = {q: 1, r: 0};

        // Act
        strategyToTest.onRightClick(data, editorState, {q: 1, r: 0});
        strategyToTest.onLeftDoubleClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.has(hexKey(1, 0))).toBe(false);
        expect(river.hasEdge({q: 0, r: 0}, {q: 1, r: 0})).toBe(false);
    });
});
