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

        // Act
        strategyToTest.onLeftClick(hexMap, defaultEditorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.has('0,0')).toBe(false);
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

        // Act
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')).toBeUndefined();
        expect(hexMap.get('1,0')).toBeUndefined();
        expect(hexMap.get('2,0')).toBeUndefined();
    });

});
