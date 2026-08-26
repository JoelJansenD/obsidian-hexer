import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { EditorState } from "../EditorState";
import { Hexagon } from "../hexagon";
import { HexerData } from "../HexerData";
import BucketStrategy from "./BucketStrategy";
import { factionLayerAccessor, HexLayerAccessor, iconLayerAccessor, terrainLayerAccessor } from "./HexLayerAccessor";

// The flood-fill scaffolding is layer-agnostic, so its connectivity behaviour is
// exercised once through the terrain accessor.
describe('BucketStrategy flood fill (terrain)', () => {

    const claimedColour = '#aaaaaa';
    const otherColour = '#bbbbbb';
    const activeColour = '#cccccc';

    let strategyToTest: BucketStrategy;
    let hexMap: Record<string, Hexagon>;
    let data: HexerData;

    const editorState: EditorState = { ...defaultEditorState, activeColour };

    beforeEach(() => {
        strategyToTest = new BucketStrategy(terrainLayerAccessor);

        // A connected chain and branch sharing the claimed colour, requiring the
        // fill to recurse across several hops from the clicked hex.
        hexMap = {};
        hexMap['0,0'] = { q: 0, r: 0, terrainColor: claimedColour, icon: null, factionId: null };
        hexMap['1,0'] = { q: 1, r: 0, terrainColor: claimedColour, icon: null, factionId: null };
        hexMap['2,0'] = { q: 2, r: 0, terrainColor: claimedColour, icon: null, factionId: null };
        hexMap['3,0'] = { q: 3, r: 0, terrainColor: claimedColour, icon: null, factionId: null };
        hexMap['1,-1'] = { q: 1, r: -1, terrainColor: claimedColour, icon: null, factionId: null };

        // A connected hex of a different colour that must not be filled.
        hexMap['2,-1'] = { q: 2, r: -1, terrainColor: otherColour, icon: null, factionId: null };

        // A same-colour hex that is disconnected and must not be filled.
        hexMap['10,10'] = { q: 10, r: 10, terrainColor: claimedColour, icon: null, factionId: null };

        data = createHexerData({ hexes: hexMap });
    });

    it('fills connected hexes sharing the clicked value, and nothing else', () => {
        // Act
        strategyToTest.getEvents().onLeftClick!(data, editorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap['0,0'].terrainColor).toBe(activeColour);
        expect(hexMap['1,0'].terrainColor).toBe(activeColour);
        expect(hexMap['2,0'].terrainColor).toBe(activeColour);
        expect(hexMap['3,0'].terrainColor).toBe(activeColour);
        expect(hexMap['1,-1'].terrainColor).toBe(activeColour);
        expect(hexMap['2,-1'].terrainColor).toBe(otherColour);
        expect(hexMap['10,10'].terrainColor).toBe(claimedColour);
    });

    it('fills connected hexes sharing an empty value', () => {
        // Arrange
        const emptyHexMap: Record<string, Hexagon> = {};
        emptyHexMap['0,0'] = { q: 0, r: 0, terrainColor: null, icon: null, factionId: null };
        emptyHexMap['1,0'] = { q: 1, r: 0, terrainColor: null, icon: null, factionId: null };
        const emptyData = createHexerData({ hexes: emptyHexMap });

        // Act
        strategyToTest.getEvents().onLeftClick!(emptyData, editorState, { q: 0, r: 0 });

        // Assert
        expect(emptyHexMap['0,0'].terrainColor).toBe(activeColour);
        expect(emptyHexMap['1,0'].terrainColor).toBe(activeColour);
    });

    it('does nothing when the clicked hex does not exist', () => {
        // Act
        strategyToTest.getEvents().onLeftClick!(data, editorState, { q: 99, r: 99 });

        // Assert
        expect('99,99' in hexMap).toBe(false);
        expect(hexMap['0,0'].terrainColor).toBe(claimedColour);
    });
});

// Each accessor supplies the boundary predicate; this verifies each one is wired
// through the shared operation correctly.
const castle = { name: 'castle', color: '#aaaaaa' };

interface BoundaryCase {
    name: string;
    accessor: HexLayerAccessor;
    claimed: (q: number, r: number) => Hexagon;
    other: (q: number, r: number) => Hexagon;
    editorState: EditorState;
    read: (hex: Hexagon) => unknown;
    filled: unknown;
    otherValue: unknown;
}

const boundaryCases: BoundaryCase[] = [
    {
        name: 'terrain',
        accessor: terrainLayerAccessor,
        claimed: (q, r) => ({ q, r, terrainColor: '#aaaaaa', icon: null, factionId: null }),
        other: (q, r) => ({ q, r, terrainColor: '#bbbbbb', icon: null, factionId: null }),
        editorState: { ...defaultEditorState, activeColour: '#cccccc' },
        read: (hex) => hex.terrainColor,
        filled: '#cccccc',
        otherValue: '#bbbbbb'
    },
    {
        name: 'icon',
        accessor: iconLayerAccessor,
        // Same name, different colour: the accessor treats these as distinct.
        claimed: (q, r) => ({ q, r, terrainColor: null, icon: { ...castle }, factionId: null }),
        other: (q, r) => ({ q, r, terrainColor: null, icon: { name: 'castle', color: '#bbbbbb' }, factionId: null }),
        editorState: { ...defaultEditorState, activeIcon: { name: 'dungeon-gate', color: '#cccccc' } },
        read: (hex) => hex.icon,
        filled: { name: 'dungeon-gate', color: '#cccccc' },
        otherValue: { name: 'castle', color: '#bbbbbb' }
    },
    {
        name: 'faction',
        accessor: factionLayerAccessor,
        claimed: (q, r) => ({ q, r, terrainColor: null, icon: null, factionId: 'faction-a' }),
        other: (q, r) => ({ q, r, terrainColor: null, icon: null, factionId: 'faction-b' }),
        editorState: { ...defaultEditorState, activeFactionId: 'faction-c' },
        read: (hex) => hex.factionId,
        filled: 'faction-c',
        otherValue: 'faction-b'
    }
];

describe.each(boundaryCases)('BucketStrategy respects the $name boundary', ({ accessor, claimed, other, editorState, read, filled, otherValue }) => {
    it('fills connected same-value hexes but stops at a differing neighbour', () => {
        // Arrange
        const hexMap: Record<string, Hexagon> = {};
        hexMap['0,0'] = claimed(0, 0);
        hexMap['1,0'] = claimed(1, 0);
        hexMap['2,0'] = other(2, 0);
        const data = createHexerData({ hexes: hexMap });
        const strategyToTest = new BucketStrategy(accessor);

        // Act
        strategyToTest.getEvents().onLeftClick!(data, editorState, { q: 0, r: 0 });

        // Assert
        expect(read(hexMap['0,0'])).toEqual(filled);
        expect(read(hexMap['1,0'])).toEqual(filled);
        expect(read(hexMap['2,0'])).toEqual(otherValue);
    });
});
