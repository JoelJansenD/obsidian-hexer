import FactionBucketStrategy from "./FactionBucketStrategy";
import { HexerData, HexMap } from "../HexerData";
import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";

describe('onLeftClick', () => {

    let strategyToTest: FactionBucketStrategy;
    let hexMap: HexMap;
    let data: HexerData;

    const claimedFactionId = 'faction-a';
    const otherFactionId = 'faction-b';

    beforeEach(() => {
        strategyToTest = new FactionBucketStrategy();

        // A connected chain and branch of hexes belonging to the same faction,
        // requiring the fill to recurse across several hops from the clicked hex.
        hexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: null, factionId: claimedFactionId });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: null, factionId: claimedFactionId });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: null, icon: null, factionId: claimedFactionId });
        hexMap.set('3,0', { q: 3, r: 0, terrainColor: null, icon: null, factionId: claimedFactionId });
        hexMap.set('1,-1', { q: 1, r: -1, terrainColor: null, icon: null, factionId: claimedFactionId });

        // A connected hex of a different faction that must not be filled.
        hexMap.set('2,-1', { q: 2, r: -1, terrainColor: null, icon: null, factionId: otherFactionId });

        // A same-faction hex that is disconnected and must not be filled.
        hexMap.set('10,10', { q: 10, r: 10, terrainColor: null, icon: null, factionId: claimedFactionId });

        data = createHexerData({ hexes: hexMap });
    });

    it('fills connected hexes sharing the same faction', () => {
        // Arrange
        const activeFactionId = 'faction-c';
        const editorState = {...defaultEditorState, activeFactionId};

        // Act
        strategyToTest.onLeftClick(data, editorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.factionId).toBe(activeFactionId);
        expect(hexMap.get('1,0')!.factionId).toBe(activeFactionId);
        expect(hexMap.get('2,0')!.factionId).toBe(activeFactionId);
        expect(hexMap.get('3,0')!.factionId).toBe(activeFactionId);
        expect(hexMap.get('1,-1')!.factionId).toBe(activeFactionId);
        expect(hexMap.get('2,-1')!.factionId).toBe(otherFactionId);
        expect(hexMap.get('10,10')!.factionId).toBe(claimedFactionId);
    });

    it('fills connected hexes sharing an empty faction', () => {
        // Arrange
        const emptyHexMap = new Map<string, Hexagon>();
        emptyHexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: null, factionId: null });
        emptyHexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: null, factionId: null });
        const emptyData = createHexerData({ hexes: emptyHexMap });

        const activeFactionId = 'faction-c';
        const editorState = {...defaultEditorState, activeFactionId};

        // Act
        strategyToTest.onLeftClick(emptyData, editorState, { q: 0, r: 0 });

        // Assert
        expect(emptyHexMap.get('0,0')!.factionId).toBe(activeFactionId);
        expect(emptyHexMap.get('1,0')!.factionId).toBe(activeFactionId);

    });

});
