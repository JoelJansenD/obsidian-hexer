import defaultEditorState from "../../__test/defaultEditorState";
import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import IconEraserStrategy from "./IconEraserStrategy";

describe('onLeftClick', () => {

    let strategyToTest: IconEraserStrategy;
    beforeEach(() => {
        strategyToTest = new IconEraserStrategy();
    });

    it('removes the hexagon from the map if it is empty after erasing', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });

        // Act
        strategyToTest.onLeftClick(hexMap, defaultEditorState, { q: 0, r: 0 });

        // Assert
        expect(hexMap.has('0,0')).toBe(false);
    });

    it('clears only the icon if a terrain colour is also present', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: { name: 'castle', color: '#ff0000' } });

        // Act
        strategyToTest.onLeftClick(hexMap, defaultEditorState, { q: 0, r: 0 });

        // Assert
        const result = hexMap.get('0,0');
        expect(result?.icon).toBeNull();
        expect(result?.terrainColor).toBe('#ff0000');
    });

});

describe('onLeftDrag', () => {

    let strategyToTest: IconEraserStrategy;
    beforeEach(() => {
        strategyToTest = new IconEraserStrategy();
    });

    it('erases existing icons as the mouse moves across them', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: null, icon: { name: 'castle', color: '#ff0000' } });

        // Act
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')).toBeUndefined();
        expect(hexMap.get('1,0')).toBeUndefined();
        expect(hexMap.get('2,0')).toBeUndefined();
    });

    it('clears only the icon as the mouse moves across hexagons that also have a terrain colour', () => {
        // Arrange
        const hexMap: HexMap = new Map<string, Hexagon>();
        hexMap.set('0,0', { q: 0, r: 0, terrainColor: '#000000', icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('1,0', { q: 1, r: 0, terrainColor: '#000000', icon: { name: 'castle', color: '#ff0000' } });
        hexMap.set('2,0', { q: 2, r: 0, terrainColor: '#000000', icon: { name: 'castle', color: '#ff0000' } });

        // Act
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 0, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 1, r: 0 });
        strategyToTest.onLeftDrag(hexMap, defaultEditorState, { q: 2, r: 0 });

        // Assert
        expect(hexMap.get('0,0')?.icon).toBeNull();
        expect(hexMap.get('1,0')?.icon).toBeNull();
        expect(hexMap.get('2,0')?.icon).toBeNull();
        expect(hexMap.get('0,0')?.terrainColor).toBe('#000000');
        expect(hexMap.get('1,0')?.terrainColor).toBe('#000000');
        expect(hexMap.get('2,0')?.terrainColor).toBe('#000000');
    });

});
