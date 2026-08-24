import defaultEditorState from "../../__test/defaultEditorState";
import { EditorState } from "../EditorState";
import { Hexagon } from "../hexagon";
import { factionLayerAccessor, HexLayerAccessor, iconLayerAccessor, terrainLayerAccessor } from "./HexLayerAccessor";

const emptyHex = (): Hexagon => ({ q: 0, r: 0, terrainColor: null, icon: null, factionId: null });

describe('terrainLayerAccessor', () => {
    it('applies the active colour', () => {
        const hex = emptyHex();
        terrainLayerAccessor.apply(hex, { ...defaultEditorState, activeColour: '#ff0000' });
        expect(hex.terrainColor).toBe('#ff0000');
    });

    it('clears the colour', () => {
        const hex = { ...emptyHex(), terrainColor: '#ff0000' };
        terrainLayerAccessor.clear(hex);
        expect(hex.terrainColor).toBeNull();
    });

    it('matches on colour', () => {
        const a = { ...emptyHex(), terrainColor: '#ff0000' };
        expect(terrainLayerAccessor.matches(a, { ...a })).toBe(true);
        expect(terrainLayerAccessor.matches(a, { ...emptyHex(), terrainColor: '#00ff00' })).toBe(false);
    });
});

describe('iconLayerAccessor', () => {
    it('applies a copy of the active icon', () => {
        const hex = emptyHex();
        const editorState: EditorState = { ...defaultEditorState, activeIcon: { name: 'castle', color: '#ff0000' } };
        iconLayerAccessor.apply(hex, editorState);
        expect(hex.icon).toEqual({ name: 'castle', color: '#ff0000' });
        expect(hex.icon).not.toBe(editorState.activeIcon);
    });

    it('clears the icon', () => {
        const hex = { ...emptyHex(), icon: { name: 'castle', color: '#ff0000' } };
        iconLayerAccessor.clear(hex);
        expect(hex.icon).toBeNull();
    });

    it('matches on both icon name and colour', () => {
        const a = { ...emptyHex(), icon: { name: 'castle', color: '#ff0000' } };
        expect(iconLayerAccessor.matches(a, { ...emptyHex(), icon: { name: 'castle', color: '#ff0000' } })).toBe(true);
        expect(iconLayerAccessor.matches(a, { ...emptyHex(), icon: { name: 'castle', color: '#00ff00' } })).toBe(false);
        expect(iconLayerAccessor.matches(a, { ...emptyHex(), icon: { name: 'dungeon-gate', color: '#ff0000' } })).toBe(false);
        expect(iconLayerAccessor.matches(emptyHex(), emptyHex())).toBe(true);
    });
});

describe('factionLayerAccessor', () => {
    it('applies the active faction id', () => {
        const hex = emptyHex();
        factionLayerAccessor.apply(hex, { ...defaultEditorState, activeFactionId: 'faction-1' });
        expect(hex.factionId).toBe('faction-1');
    });

    it('clears the faction id', () => {
        const hex = { ...emptyHex(), factionId: 'faction-1' };
        factionLayerAccessor.clear(hex);
        expect(hex.factionId).toBeNull();
    });

    it('matches on faction id', () => {
        const a = { ...emptyHex(), factionId: 'faction-1' };
        expect(factionLayerAccessor.matches(a, { ...a })).toBe(true);
        expect(factionLayerAccessor.matches(a, { ...emptyHex(), factionId: 'faction-2' })).toBe(false);
    });
});

describe('accessor identity', () => {
    const cases: [string, HexLayerAccessor][] = [
        ['terrain', terrainLayerAccessor],
        ['icon', iconLayerAccessor],
        ['faction', factionLayerAccessor]
    ];

    it.each(cases)('%s accessor reports its layer', (layer, accessor) => {
        expect(accessor.layer).toBe(layer);
    });
});
