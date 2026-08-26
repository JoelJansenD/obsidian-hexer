import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { EditorState } from "../EditorState";
import { Hexagon } from "../hexagon";
import BrushStrategy from "./BrushStrategy";
import { factionLayerAccessor, HexLayerAccessor, iconLayerAccessor, terrainLayerAccessor } from "./HexLayerAccessor";

const expectedIcon = { name: 'castle', color: '#ff0000' };

interface BrushCase {
    name: string;
    accessor: HexLayerAccessor;
    editorState: EditorState;
    read: (hex: Hexagon) => unknown;
    expected: unknown;
}

const cases: BrushCase[] = [
    {
        name: 'terrain',
        accessor: terrainLayerAccessor,
        editorState: { ...defaultEditorState, activeColour: '#ff0000' },
        read: (hex) => hex.terrainColor,
        expected: '#ff0000'
    },
    {
        name: 'icon',
        accessor: iconLayerAccessor,
        editorState: { ...defaultEditorState, activeIcon: expectedIcon },
        read: (hex) => hex.icon,
        expected: expectedIcon
    },
    {
        name: 'faction',
        accessor: factionLayerAccessor,
        editorState: { ...defaultEditorState, activeFactionId: 'faction-1' },
        read: (hex) => hex.factionId,
        expected: 'faction-1'
    }
];

describe.each(cases)('BrushStrategy ($name)', ({ accessor, editorState, read, expected }) => {

    let strategyToTest: BrushStrategy;
    beforeEach(() => {
        strategyToTest = new BrushStrategy(accessor);
    });

    it('creates and paints an empty hex when clicked', () => {
        // Arrange
        const hexMap: Record<string, Hexagon> = {};
        const data = createHexerData({ hexes: hexMap });

        // Act
        strategyToTest.getEvents().onLeftClick!(data, editorState, { q: 0, r: 0 });

        // Assert
        expect(read(hexMap['0,0'])).toEqual(expected);
    });

    it('paints hexes as the mouse drags across them, creating them as needed', () => {
        // Arrange
        const hexMap: Record<string, Hexagon> = {};
        const data = createHexerData({ hexes: hexMap });

        // Act
        const drag = strategyToTest.getEvents().onLeftDrag!;
        drag(data, editorState, { q: 0, r: 0 });
        drag(data, editorState, { q: 1, r: 0 });
        drag(data, editorState, { q: 2, r: 0 });

        // Assert
        expect(read(hexMap['0,0'])).toEqual(expected);
        expect(read(hexMap['1,0'])).toEqual(expected);
        expect(read(hexMap['2,0'])).toEqual(expected);
    });
});
