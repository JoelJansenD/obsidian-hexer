import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import TerrainEraserStrategy from "./TerrainEraserStrategy";

describe('onLeftClick', () => {

    let strategyToTest: TerrainEraserStrategy;
    beforeEach(() => {
        strategyToTest = new TerrainEraserStrategy();
    });

    it('erases an existing terrain tile when clicking on it', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000' });

        // Act
        strategyToTest.onLeftClick(hexMap, defaultEditorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(result.terrainColor).toBeNull();
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
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000' });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000' });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000' });

        // Act
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBeNull();
        expect(hexMap.get('1,0')!.terrainColor).toBeNull();
        expect(hexMap.get('2,0')!.terrainColor).toBeNull();
    });

});
