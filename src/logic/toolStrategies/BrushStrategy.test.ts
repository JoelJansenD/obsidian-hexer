import BrushStrategy from "./BrushStrategy";
import createHexerData from "../../__test/createHexerData";
import { HexMap } from "../HexerData";
import { hexFieldLayerCases, makeHex } from "../../__test/hexFieldLayerCases";
import { iconLayerDescriptor } from "./hexFieldLayers";
import defaultEditorState from "../../__test/defaultEditorState";

describe.each(hexFieldLayerCases)('BrushStrategy on the $name layer', ({ descriptor, valueA, valueB, stateWith }) => {
    const events = () => new BrushStrategy(descriptor).getEvents();

    it('paints the active value over an existing hex', () => {
        const hexMap: HexMap = new Map();
        hexMap.set('0,0', makeHex(0, 0));
        descriptor.write(hexMap.get('0,0')!, valueB);
        const data = createHexerData({ hexes: hexMap });

        events().onLeftClick!(data, stateWith(valueA), { q: 0, r: 0 });

        expect(descriptor.equals(descriptor.read(hexMap.get('0,0')!), valueA)).toBe(true);
    });

    it('creates a hex when painting an empty coordinate', () => {
        const data = createHexerData();

        events().onLeftClick!(data, stateWith(valueA), { q: 1, r: 1 });

        const created = data.getHex({ q: 1, r: 1 });
        expect(created).toBeDefined();
        expect(descriptor.equals(descriptor.read(created!), valueA)).toBe(true);
    });

    it('paints and creates hexes as the mouse drags across them', () => {
        const data = createHexerData();
        const onLeftDrag = events().onLeftDrag!;

        onLeftDrag(data, stateWith(valueA), { q: 0, r: 0 });
        onLeftDrag(data, stateWith(valueA), { q: 1, r: 0 });
        onLeftDrag(data, stateWith(valueA), { q: 2, r: 0 });

        expect(descriptor.equals(descriptor.read(data.getHex({ q: 0, r: 0 })!), valueA)).toBe(true);
        expect(descriptor.equals(descriptor.read(data.getHex({ q: 1, r: 0 })!), valueA)).toBe(true);
        expect(descriptor.equals(descriptor.read(data.getHex({ q: 2, r: 0 })!), valueA)).toBe(true);
    });
});

// The icon descriptor stores structured values, so it must clone rather than
// alias the editor state's active icon; the primitive layers cannot regress here.
describe('BrushStrategy on the icon layer clones the painted icon', () => {
    it('does not alias the editor state icon', () => {
        const data = createHexerData();
        const activeIcon = { name: 'castle', color: '#ff0000' };
        const state = { ...defaultEditorState, activeIcon };

        new BrushStrategy(iconLayerDescriptor).getEvents().onLeftClick!(data, state, { q: 0, r: 0 });

        const painted = data.getHex({ q: 0, r: 0 })!.icon;
        expect(painted).toEqual(activeIcon);
        expect(painted).not.toBe(activeIcon);
    });
});
