import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import EraserStrategy from "./EraserStrategy";
import { factionLayerAccessor, HexLayerAccessor, iconLayerAccessor, terrainLayerAccessor } from "./HexLayerAccessor";

const icon = { name: 'castle', color: '#111111' };

interface EraserCase {
    name: string;
    accessor: HexLayerAccessor;
    // A hex where only this layer is set, so erasing empties it entirely.
    only: (q: number, r: number) => Hexagon;
    // A hex where this layer and one other are set, so erasing leaves the hex behind.
    withOther: (q: number, r: number) => Hexagon;
    readSelf: (hex: Hexagon) => unknown;
    readOther: (hex: Hexagon) => unknown;
    expectedOther: unknown;
}

const cases: EraserCase[] = [
    {
        name: 'terrain',
        accessor: terrainLayerAccessor,
        only: (q, r) => ({ q, r, terrainColor: '#ff0000', icon: null, factionId: null }),
        withOther: (q, r) => ({ q, r, terrainColor: '#ff0000', icon: { ...icon }, factionId: null }),
        readSelf: (hex) => hex.terrainColor,
        readOther: (hex) => hex.icon,
        expectedOther: icon
    },
    {
        name: 'icon',
        accessor: iconLayerAccessor,
        only: (q, r) => ({ q, r, terrainColor: null, icon: { ...icon }, factionId: null }),
        withOther: (q, r) => ({ q, r, terrainColor: '#ff0000', icon: { ...icon }, factionId: null }),
        readSelf: (hex) => hex.icon,
        readOther: (hex) => hex.terrainColor,
        expectedOther: '#ff0000'
    },
    {
        name: 'faction',
        accessor: factionLayerAccessor,
        only: (q, r) => ({ q, r, terrainColor: null, icon: null, factionId: 'faction-1' }),
        withOther: (q, r) => ({ q, r, terrainColor: '#ff0000', icon: null, factionId: 'faction-1' }),
        readSelf: (hex) => hex.factionId,
        readOther: (hex) => hex.terrainColor,
        expectedOther: '#ff0000'
    }
];

describe.each(cases)('EraserStrategy ($name)', ({ accessor, only, withOther, readSelf, readOther, expectedOther }) => {

    let strategyToTest: EraserStrategy;
    beforeEach(() => {
        strategyToTest = new EraserStrategy(accessor);
    });

    it('removes the hex from the map when it is empty after erasing', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', only(0, 0));
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.getEvents().onLeftClick!(data, defaultEditorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.has('0,0')).toBe(false);
    });

    it('clears only this layer when another layer is present', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', withOther(0, 0));
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.getEvents().onLeftClick!(data, defaultEditorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(readSelf(result)).toBeNull();
        expect(readOther(result)).toEqual(expectedOther);
    });

    it('erases hexes as the mouse drags across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', only(0, 0));
        hexMap.set('1,0', only(1, 0));
        hexMap.set('2,0', only(2, 0));
        const data = createHexerData({ hexes: hexMap });

        // Act
        const drag = strategyToTest.getEvents().onLeftDrag!;
        drag(data, defaultEditorState, { q: 0, r: 0 });
        drag(data, defaultEditorState, { q: 1, r: 0 });
        drag(data, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.has('0,0')).toBe(false);
        expect(hexMap.has('1,0')).toBe(false);
        expect(hexMap.has('2,0')).toBe(false);
    });
});
