import { EditorState, Layer } from "../EditorState";
import { Hexagon } from "../hexagon";

/**
 * Encapsulates everything the paint operations need to know about a single
 * paintable layer of a hexagon. Brush, Bucket and Eraser are identical apart
 * from these three functions, so the operations stay generic and each layer's
 * specifics live here in one place.
 */
export interface HexLayerAccessor {
    readonly layer: Layer;
    /** Write the editor's active value for this layer onto the hexagon. */
    apply(hex: Hexagon, editorState: EditorState): void;
    /** Clear this layer's value on the hexagon. */
    clear(hex: Hexagon): void;
    /** Do two hexagons share the same value on this layer? (bucket-fill boundary) */
    matches(a: Hexagon, b: Hexagon): boolean;
}

export const terrainLayerAccessor: HexLayerAccessor = {
    layer: 'terrain',
    apply: (hex, editorState) => { hex.terrainColor = editorState.activeColour; },
    clear: (hex) => { hex.terrainColor = null; },
    matches: (a, b) => a.terrainColor === b.terrainColor
};

export const iconLayerAccessor: HexLayerAccessor = {
    layer: 'icon',
    apply: (hex, editorState) => { hex.icon = { ...editorState.activeIcon }; },
    clear: (hex) => { hex.icon = null; },
    matches: (a, b) => a.icon?.name === b.icon?.name && a.icon?.color === b.icon?.color
};

export const factionLayerAccessor: HexLayerAccessor = {
    layer: 'faction',
    apply: (hex, editorState) => { hex.factionId = editorState.activeFactionId; },
    clear: (hex) => { hex.factionId = null; },
    matches: (a, b) => a.factionId === b.factionId
};

export const paintableLayerAccessors: readonly HexLayerAccessor[] = [
    terrainLayerAccessor,
    iconLayerAccessor,
    factionLayerAccessor
];
