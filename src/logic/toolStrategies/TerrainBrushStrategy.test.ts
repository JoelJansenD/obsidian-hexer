import createHexerData from "../../__test/createHexerData";
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
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null, factionId: null });
        const data = createHexerData({ hexes: hexMap });
        const expectedColor = '#ff0000';
        const editorState = {...defaultEditorState, activeColor: expectedColor};

        // Act
        strategyToTest.onLeftClick(data, editorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(result.terrainColor).toBe(expectedColor);
    });

    it('creates a new terrain tile when clicking on an empty hexagon', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const data = createHexerData({ hexes: hexMap });
        const expectedColor = '#00ff00';
        const editorState = {...defaultEditorState, activeColor: expectedColor};

        // Act
        strategyToTest.onLeftClick(data, editorState, { q: 1, r: 1 });

        // Assert
        const result = hexMap.get('1,1')!;
        expect(result.terrainColor).toBe(expectedColor);
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
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null, factionId: null });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon: null, factionId: null });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon: null, factionId: null });
        const data = createHexerData({ hexes: hexMap });
        const expectedColor = '#ff0000';
        const editorState = {...defaultEditorState, activeColor: expectedColor};

        // Act
        strategyToTest.onLeftDrag(data, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBe(expectedColor);
        expect(hexMap.get('1,0')!.terrainColor).toBe(expectedColor);
        expect(hexMap.get('2,0')!.terrainColor).toBe(expectedColor);
    });

    it('creates new terrain tiles when dragging over empty hexagons', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const data = createHexerData({ hexes: hexMap });
        const expectedColor = '#00ff00';
        const editorState = {...defaultEditorState, activeColor: expectedColor};

        // Act
        strategyToTest.onLeftDrag(data, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBe(expectedColor);
        expect(hexMap.get('1,0')!.terrainColor).toBe(expectedColor);
        expect(hexMap.get('2,0')!.terrainColor).toBe(expectedColor);
    });
});
