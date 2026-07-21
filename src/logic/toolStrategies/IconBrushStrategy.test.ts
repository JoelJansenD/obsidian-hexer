import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon, Icon } from "../hexagon";
import { HexMap } from "../HexerData";
import IconBrushStrategy from "./IconBrushStrategy";

describe('onLeftClick', () => {

    let strategyToTest: IconBrushStrategy;
    beforeEach(() => {
        strategyToTest = new IconBrushStrategy();
    });

    it('paints an icon onto the target hexagon', () => {

        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null });
        const expectedIcon: Icon = {
            name: 'castle',
            color: '#ff0000'
        };
        const editorState = {...defaultEditorState, activeColour: '#ff0000', activeIcon: expectedIcon};

        // Act
        strategyToTest.onLeftClick(hexMap, editorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0')!;
        expect(result.icon).toEqual(expectedIcon);        
    });

    it.todo('creates a new hexagon with an icon when clicking on an empty hexagon');
});

describe('onLeftDrag', () => {

    let strategyToTest: IconBrushStrategy;
    beforeEach(() => {
        strategyToTest = new IconBrushStrategy();
    });

    it.todo('paints icons onto hexagons as the mouse moves across them');

    it.todo('creates new hexagons with icons when dragging over empty hexagons');
});
