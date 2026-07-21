import TerrainBucketStrategy from "./TerrainBucketStrategy";
import { HexMap } from "../HexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
describe('onLeftClick', () => {

    let strategyToTest: TerrainBucketStrategy;
    let hexMap: HexMap;

    beforeEach(() => {
        strategyToTest = new TerrainBucketStrategy();

        // A connected chain and branch of same-colour hexes that requires the
        // fill to recurse across several hops from the clicked hex.
        hexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: null });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#ff0000', icon: null });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#ff0000', icon: null });
        hexMap.set('3,0', { q: 3, r: 0, terrainColor: '#ff0000', icon: null });
        hexMap.set('1,-1', { q: 1, r: -1, terrainColor: '#ff0000', icon: null });

        // A connected hex of a different colour that must not be filled.
        hexMap.set('2,-1', { q: 2, r: -1, terrainColor: '#0000ff', icon: null });

        // A same-colour hex that is disconnected and must not be filled.
        hexMap.set('10,10', { q: 10, r: 10, terrainColor: '#ff0000', icon: null });
    });

    it('fills connected hexes sharing the same terrain colour', () => {
        // Arrange
        const fillColour = '#00ff00';
        const editorState = {...defaultEditorState, activeColour: fillColour};

        // Act
        strategyToTest.onLeftClick(hexMap, editorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.terrainColor).toBe(fillColour);
        expect(hexMap.get('1,0')!.terrainColor).toBe(fillColour);
        expect(hexMap.get('2,0')!.terrainColor).toBe(fillColour);
        expect(hexMap.get('3,0')!.terrainColor).toBe(fillColour);
        expect(hexMap.get('1,-1')!.terrainColor).toBe(fillColour);
        expect(hexMap.get('2,-1')!.terrainColor).toBe('#0000ff');
        expect(hexMap.get('10,10')!.terrainColor).toBe('#ff0000');
    });

    it('fills connected hexes sharing an empty terrain colour', () => {
        // Arrange
        const emptyHexMap = new Map<string, Hexagon>();
        emptyHexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: null });
        emptyHexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: null });

        const fillColour = '#00ff00';
        const editorState = {...defaultEditorState, activeColour: fillColour};

        // Act
        strategyToTest.onLeftClick(emptyHexMap, editorState, { q: 0, r: 0 });

        // Assert
        expect(emptyHexMap.get('0,0')!.terrainColor).toBe(fillColour);
        expect(emptyHexMap.get('1,0')!.terrainColor).toBe(fillColour);

    });

});
