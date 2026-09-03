/** The orientation the map's hexes are drawn in. */
export type HexOrientation = 'flat-top' | 'pointy-top';

/** Map-wide settings that apply to the whole Hexer map rather than a single hex. */
export interface MapSettings {
    /** The display name of the map. */
    name: string;
    /** Whether hexes are drawn flat-top or pointy-top. */
    hexOrientation: HexOrientation;
    /** Whether the outline of each hex is rendered. */
    displayHexBorders: boolean;
    /** Whether the crosshair guiding the cursor is rendered. */
    displayCrosshair: boolean;
    /** Whether each non-empty hex is labelled with its `q,r` coordinate. */
    displayCoordinates: boolean;
    /**
     * The map-wide convention that computes each hex's note path from its
     * coordinate label, with `{{col}}`/`{{row}}` tokens. Empty disables hex-note
     * navigation. See {@link resolveHexNotePath} and ADR 0013.
     */
    noteConvention: string;
    /**
     * Vault path of a note whose contents seed a freshly created hex note (with
     * the coordinate tokens substituted). Empty means new hex notes start blank.
     */
    noteTemplate: string;
}

/** The settings a freshly created map starts with. */
export function defaultMapSettings(): MapSettings {
    return {
        name: '',
        hexOrientation: 'flat-top',
        displayHexBorders: true,
        displayCrosshair: true,
        displayCoordinates: true,
        noteConvention: '',
        noteTemplate: '',
    };
}
