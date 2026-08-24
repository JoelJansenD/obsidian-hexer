import { EditorState, HexFieldLayer } from "../EditorState";
import { Hexagon } from "../hexagon";
import { Icon } from "../icon";

/**
 * Captures everything that differs between the hex-field layers (terrain, icon,
 * faction): which field a tool reads and writes, where the paint value comes
 * from in the editor state, and how two field values compare when a bucket fill
 * decides its region. The generic Brush/Bucket/Eraser strategies are
 * parameterised over this, so a new hex-field layer is one descriptor, not three
 * near-identical strategy classes.
 */
export interface HexFieldLayerDescriptor<T> {
    readonly layer: HexFieldLayer;
    /** The value the brush/bucket paints, taken from the current editor state. */
    valueFromState(state: EditorState): T | null;
    /** The layer's current value on a hex. */
    read(hex: Hexagon): T | null;
    /** Writes the layer's value onto a hex; `null` clears it. */
    write(hex: Hexagon, value: T | null): void;
    /** Whether two field values are equal, deciding a bucket fill's region. */
    equals(a: T | null, b: T | null): boolean;
}

const referenceEquals = <T>(a: T | null, b: T | null): boolean => a === b;

export const terrainLayerDescriptor: HexFieldLayerDescriptor<string> = {
    layer: 'terrain',
    valueFromState: state => state.activeColor,
    read: hex => hex.terrainColor,
    write: (hex, value) => { hex.terrainColor = value; },
    equals: referenceEquals,
};

export const factionLayerDescriptor: HexFieldLayerDescriptor<string> = {
    layer: 'faction',
    valueFromState: state => state.activeFactionId,
    read: hex => hex.factionId,
    write: (hex, value) => { hex.factionId = value; },
    equals: referenceEquals,
};

export const iconLayerDescriptor: HexFieldLayerDescriptor<Icon> = {
    layer: 'icon',
    // Cloned so the painted hex owns its icon rather than aliasing editor state.
    valueFromState: state => ({ ...state.activeIcon }),
    read: hex => hex.icon,
    write: (hex, value) => { hex.icon = value ? { ...value } : null; },
    equals: (a, b) => a?.name === b?.name && a?.color === b?.color,
};

// Erased to `any` because T sits in both covariant (read) and contravariant
// (write) positions, so the concrete descriptors are not mutually assignable to
// a shared T; each strategy re-fixes its own T when constructed from an entry.
export const HEX_FIELD_LAYER_DESCRIPTORS: readonly HexFieldLayerDescriptor<any>[] = [
    terrainLayerDescriptor,
    iconLayerDescriptor,
    factionLayerDescriptor,
];
