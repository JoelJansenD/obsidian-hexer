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
        const editorState = {...defaultEditorState, activePath: { path: new Path('Nonexistent path'), activeNode: null } };
        const data = defaultHexerData.clone();

        // Act & Assert
        expect(() => {
            strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});
        }).toThrow(`Active path 'Nonexistent path' with id ${editorState.activePath.path.id} not found in data.`);
    });

    it('adds a node to the active path when a path is active', () => {
        // Arrange
        const editorState = {...defaultEditorState, activePath: { path: targetPath, activeNode: null } };
        const data = defaultHexerData.clone();

        // Act
        strategyToTest.onLeftClick(data, editorState, {q: 0, r: 0});

        // Assert
        const river = data.rivers[0];
        expect(river.nodes.size).toBe(1);
        expect(river.nodes.has('0,0')).toBe(true);
    });

});
