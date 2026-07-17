import defaultEditorState from "../../__test/defaultEditorState";
import { HexMap } from "../HexerData";
import { Hexagon } from "../hexagon";
import TerrainPaintStrategy from "./TerrainPaintStrategy";

describe('TerrainPaintStrategy', () => {

    let strategyToTest: TerrainPaintStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainPaintStrategy();
    });

    it('paints over an existing terrain tile with a new terrain tile', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000' });
        const expectedColour = '#ff0000';
        const editorState = {...defaultEditorState, activeColour: expectedColour};

        // Act
        strategyToTest.onClick(hexMap, editorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(result.terrainColor).toBe(expectedColour);
    });

    it('creates a new terrain tile when clicking on an empty hexagon', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const expectedColour = '#00ff00';
        const editorState = {...defaultEditorState, activeColour: expectedColour};
        

        // Act
        strategyToTest.onClick(hexMap, editorState, { q: 1, r: 1 });

        // Assert
        const result = hexMap.get('1,1')!;
        expect(result.terrainColor).toBe(expectedColour);
    });
});