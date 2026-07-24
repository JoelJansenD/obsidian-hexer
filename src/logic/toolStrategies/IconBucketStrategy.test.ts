import IconBucketStrategy from "./IconBucketStrategy";
import { HexMap } from "../HexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
describe('onLeftClick', () => {

    let strategyToTest: IconBucketStrategy;
    let hexMap: HexMap;

    beforeEach(() => {
        strategyToTest = new IconBucketStrategy();

        // A connected chain and branch of same-icon hexes that requires the
        // fill to recurse across several hops from the clicked hex.
        hexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('3,0', { q: 3, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('1,-1', { q: 1, r: -1, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });

        // A connected hex of a different icon that must not be filled.
        hexMap.set('2,-1', { q: 2, r: -1, terrainColor: null, icon: { name: 'dungeon-gate', color: '#0000ff' } });

        // A same-icon hex that is disconnected and must not be filled.
        hexMap.set('10,10', { q: 10, r: 10, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
    });

    it('fills connected hexes sharing the same icon', () => {
        // Arrange
        const fillIcon = { name: 'castle', color: '#00ff00' };
        const editorState = {...defaultEditorState, activeIcon: fillIcon};

        // Act
        strategyToTest.onLeftClick(hexMap, editorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.icon).toEqual(fillIcon);
        expect(hexMap.get('1,0')!.icon).toEqual(fillIcon);
        expect(hexMap.get('2,0')!.icon).toEqual(fillIcon);
        expect(hexMap.get('3,0')!.icon).toEqual(fillIcon);
        expect(hexMap.get('1,-1')!.icon).toEqual(fillIcon);
        expect(hexMap.get('2,-1')!.icon).toEqual({ name: 'dungeon-gate', color: '#0000ff' });
        expect(hexMap.get('10,10')!.icon).toEqual({ name: 'castle', color: '#ff0000' });
    });

    it('fills connected hexes sharing an empty icon', () => {
        // Arrange
        const emptyHexMap = new Map<string, Hexagon>();
        emptyHexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: null });
        emptyHexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: null });

        const fillIcon = { name: 'castle', color: '#00ff00' };
        const editorState = {...defaultEditorState, activeIcon: fillIcon};

        // Act
        strategyToTest.onLeftClick(emptyHexMap, editorState, { q: 0, r: 0 });

        // Assert
        expect(emptyHexMap.get('0,0')!.icon).toEqual(fillIcon);
        expect(emptyHexMap.get('1,0')!.icon).toEqual(fillIcon);

    });

});
