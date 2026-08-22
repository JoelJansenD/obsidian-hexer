import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import FactionEraserStrategy from "./FactionEraserStrategy";

describe('onLeftClick', () => {

    let strategyToTest: FactionEraserStrategy;
    beforeEach(() => {
        strategyToTest = new FactionEraserStrategy();
    });

    it('clears the faction from the clicked hex', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: 'faction-1' });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftClick(data, defaultEditorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.get('0,0')?.factionId).toBeNull();
    });
});

describe('onLeftDrag', () => {

    let strategyToTest: FactionEraserStrategy;
    beforeEach(() => {
        strategyToTest = new FactionEraserStrategy();
    });

    it('clears the faction from hexes as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: 'faction-1' });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#ff0000', icon: null, factionId: 'faction-1' });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#ff0000', icon: null, factionId: 'faction-1' });
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')?.factionId).toBeNull();
        expect(hexMap.get('1,0')?.factionId).toBeNull();
        expect(hexMap.get('2,0')?.factionId).toBeNull();
    });
});
