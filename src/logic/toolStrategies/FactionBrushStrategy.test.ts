import createHexerData from "../../__test/createHexerData";
import defaultEditorState from "../../__test/defaultEditorState";
import { HexMap } from "../HexerData";
import { Hexagon } from "../hexagon";
import FactionBrushStrategy from "./FactionBrushStrategy";

describe('onLeftClick', () => {

    let strategyToTest: FactionBrushStrategy;
    beforeEach(() => {
        strategyToTest = new FactionBrushStrategy();
    });

    it('fills an empty hex with the active faction when clicked', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const data = createHexerData({ hexes: hexMap });
        const expectedFactionId = 'faction-1';
        const editorState = {...defaultEditorState, activeFactionId: expectedFactionId};

        // Act
        strategyToTest.onLeftClick(data, editorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(result.factionId).toBe(expectedFactionId);
    });
});

describe('onLeftDrag', () => {

    let strategyToTest: FactionBrushStrategy;
    beforeEach(() => {
        strategyToTest = new FactionBrushStrategy();
    });

    it('fills empty hexes with the active faction as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const data = createHexerData({ hexes: hexMap });
        const expectedFactionId = 'faction-1';
        const editorState = {...defaultEditorState, activeFactionId: expectedFactionId};

        // Act
        strategyToTest.onLeftDrag(data, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(data, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.factionId).toBe(expectedFactionId);
        expect(hexMap.get('1,0')!.factionId).toBe(expectedFactionId);
        expect(hexMap.get('2,0')!.factionId).toBe(expectedFactionId);
    });
});
