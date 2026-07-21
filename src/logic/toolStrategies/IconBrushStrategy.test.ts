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

    it('creates a new hexagon with an icon when clicking on an empty hexagon', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
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
});

describe('onLeftDrag', () => {

    let strategyToTest: IconBrushStrategy;
    beforeEach(() => {
        strategyToTest = new IconBrushStrategy();
    });

    it('paints icons onto hexagons as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon: null });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon: null });
        const expectedIcon = {
            name: 'castle',
            color: '#ff0000'
        };
        const editorState = {...defaultEditorState, activeColour: '#ff0000', activeIcon: expectedIcon};

        // Act
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.icon).toEqual(expectedIcon);
        expect(hexMap.get('1,0')!.icon).toEqual(expectedIcon);
        expect(hexMap.get('2,0')!.icon).toEqual(expectedIcon);
    });

    it.todo('creates new hexagons with icons when dragging over empty hexagons', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        const expectedIcon = {
            name: 'castle',
            color: '#ff0000'
        };
        const editorState = {...defaultEditorState, activeColour: '#ff0000', activeIcon: expectedIcon};

        // Act
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, editorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')!.icon).toEqual(expectedIcon);
        expect(hexMap.get('1,0')!.icon).toEqual(expectedIcon);
        expect(hexMap.get('2,0')!.icon).toEqual(expectedIcon);
    });
});
