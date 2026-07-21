import defaultEditorState from "../../__test/defaultEditorState";
import { HexMap } from "../HexerData";
import { Hexagon } from "../hexagon";
import TerrainBrushStrategy from "./TerrainBrushStrategy";

describe('onLeftClick', () => {

    let strategyToTest: TerrainBrushStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainBrushStrategy();
    });

    it('paints over an existing terrain tile with a new terrain tile', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null });
        const expectedColour = '#ff0000';
        const editorState = {...defaultEditorState, activeColour: expectedColour};

        // Act
        strategyToTest.onLeftClick(hexMap, editorState, { q: 0, r: 0 });

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
        strategyToTest.onLeftClick(hexMap, editorState, { q: 1, r: 1 });

        // Assert
        const result = hexMap.get('1,1')!;
        expect(result.terrainColor).toBe(expectedColour);
    });
});

describe('onLeftDrag', () => {

    let strategyToTest: TerrainBrushStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainBrushStrategy();
    });

    it('paints over existing terrain tiles as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon: null });
        const expectedColour = '#ff0000';
        const editorState = {...defaultEditorState, activeColour: expectedColour};

        // Act
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBe(expectedColour);
        expect(hexMap.get('1,0')!.terrainColor).toBe(expectedColour);
        expect(hexMap.get('2,0')!.terrainColor).toBe(expectedColour);
    });

    it('creates new terrain tiles when dragging over empty hexagons', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const expectedColour = '#00ff00';
        const editorState = {...defaultEditorState, activeColour: expectedColour};
        
        // Act
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBe(expectedColour);
        expect(hexMap.get('1,0')!.terrainColor).toBe(expectedColour);
        expect(hexMap.get('2,0')!.terrainColor).toBe(expectedColour);
    });
});