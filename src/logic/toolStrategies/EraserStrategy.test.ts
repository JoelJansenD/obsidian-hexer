import EraserStrategy from "./EraserStrategy";
import createHexerData from "../../__test/createHexerData";
import { HexMap } from "../HexerData";
import { Hexagon } from "../hexagon";
import { hexFieldLayerCases, makeHex } from "../../__test/hexFieldLayerCases";
import defaultEditorState from "../../__test/defaultEditorState";

describe.each(hexFieldLayerCases)('EraserStrategy on the $name layer', ({ descriptor, valueA }) => {
    const events = () => new EraserStrategy(descriptor).getEvents();

    // A hex carrying a value on every layer, so erasing one layer leaves the rest.
    const fullyPopulated = (q: number, r: number): Hexagon => {
        const hex = makeHex(q, r, {
            terrainColor: '#123456',
            icon: { name: 'castle', color: '#000000' },
            factionId: 'faction-x',
        });
        descriptor.write(hex, valueA);
        return hex;
    };

    it('clears the value and removes a hex that is now empty', () => {
        const hexMap: HexMap = new Map();
        const hex = makeHex(0, 0);
        descriptor.write(hex, valueA);
        hexMap.set('0,0', hex);
        const data = createHexerData({ hexes: hexMap });

        events().onLeftClick!(data, defaultEditorState, { q: 0, r: 0 });

        expect(data.getHex({ q: 0, r: 0 })).toBeUndefined();
    });

    it('clears only its own layer, keeping a hex that still has other values', () => {
        const hexMap: HexMap = new Map();
        hexMap.set('0,0', fullyPopulated(0, 0));
        const data = createHexerData({ hexes: hexMap });

        events().onLeftClick!(data, defaultEditorState, { q: 0, r: 0 });

        const after = data.getHex({ q: 0, r: 0 });
        expect(after).toBeDefined();
        expect(descriptor.read(after!)).toBeNull();
    });

    it('does nothing when the clicked hex does not exist', () => {
        const data = createHexerData();

        events().onLeftClick!(data, defaultEditorState, { q: 0, r: 0 });

        expect(data.getHex({ q: 0, r: 0 })).toBeUndefined();
    });

    it('clears the layer across hexes as the mouse drags', () => {
        const hexMap: HexMap = new Map();
        hexMap.set('0,0', fullyPopulated(0, 0));
        hexMap.set('1,0', fullyPopulated(1, 0));
        hexMap.set('2,0', fullyPopulated(2, 0));
        const data = createHexerData({ hexes: hexMap });
        const onLeftDrag = events().onLeftDrag!;

        onLeftDrag(data, defaultEditorState, { q: 0, r: 0 });
        onLeftDrag(data, defaultEditorState, { q: 1, r: 0 });
        onLeftDrag(data, defaultEditorState, { q: 2, r: 0 });

        expect(descriptor.read(data.getHex({ q: 0, r: 0 })!)).toBeNull();
        expect(descriptor.read(data.getHex({ q: 1, r: 0 })!)).toBeNull();
        expect(descriptor.read(data.getHex({ q: 2, r: 0 })!)).toBeNull();
    });
});
