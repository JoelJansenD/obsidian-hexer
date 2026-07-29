import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import TerrainEraserStrategy from "./TerrainEraserStrategy";

describe('onLeftClick', () => {

    let strategyToTest: TerrainEraserStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainEraserStrategy();
    });

    it('removes the hexagon from the map if it is empty after erasing', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: null });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftClick(data, defaultEditorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.has('0,0')).toBe(false);
    });

    it('clears only the terrain colour if an icon is also present', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const icon = { name: 'castle', color: '#ff0000' };
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftClick(data, defaultEditorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0');
        expect(result?.terrainColor).toBeNull();
        expect(result?.icon).toEqual(icon);
    });

});

describe('onLeftDrag', () => {

    let strategyToTest: TerrainEraserStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainEraserStrategy();
    });

    it('erases existing terrain tiles as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon: null });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')).toBeUndefined();
        expect(hexMap.get('1,0')).toBeUndefined();
        expect(hexMap.get('2,0')).toBeUndefined();
    });

    it('clears only the terrain colour as the mouse moves across hexagons that also have an icon', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const icon = { name: 'castle', color: '#ff0000' };
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')?.terrainColor).toBeNull();
        expect(hexMap.get('1,0')?.terrainColor).toBeNull();
        expect(hexMap.get('2,0')?.terrainColor).toBeNull();
        expect(hexMap.get('0,0')?.icon).toEqual(icon);
        expect(hexMap.get('1,0')?.icon).toEqual(icon);
        expect(hexMap.get('2,0')?.icon).toEqual(icon);
    });

});
