import { Camera } from "./camera";
import { Faction } from "./faction";
import { Hexagon, hexagonIsEmpty, Point, pointToAxialCoordinates, AxialCoordinates, axialCoordinatesToPoint } from "./hexagon";
import { MapSettings } from "./mapSettings";
import { Path } from "./path";

/**
 * A Hexer map document. `hexes` is a plain keyed object rather than a Map so the
 * in-memory shape equals the on-disk shape — keys are `"q,r"` strings, so
 * iteration preserves insertion order and no serialization seam is needed.
 */
export interface HexerData {
    version: string;
    hexes: Record<string, Hexagon>;
    rivers: Path[];
    roads: Path[];
    factions: Faction[];
    mapSettings: MapSettings;
    camera: Camera;
    size: number;
}

export function hexKey(q: number, r: number): string {
    return `${q},${r}`;
}

export function getHex(data: HexerData, coordinates: AxialCoordinates): Hexagon | undefined;
export function getHex(data: HexerData, q: number, r: number): Hexagon | undefined;
export function getHex(data: HexerData, arg1: AxialCoordinates | number, arg2?: number): Hexagon | undefined {
    const q = typeof arg1 === 'object' ? arg1.q : arg1;
    const r = typeof arg1 === 'object' ? arg1.r : arg2!;
    return data.hexes[hexKey(q, r)];
}

export function getOrCreateHex(data: HexerData, coordinates: AxialCoordinates): Hexagon;
export function getOrCreateHex(data: HexerData, q: number, r: number): Hexagon;
export function getOrCreateHex(data: HexerData, arg1: AxialCoordinates | number, arg2?: number): Hexagon {
    const q = typeof arg1 === 'object' ? arg1.q : arg1;
    const r = typeof arg1 === 'object' ? arg1.r : arg2!;
    const key = hexKey(q, r);
    const hex = data.hexes[key];
    if(hex) {
        return hex;
    }

    const newHex = {
        q: q,
        r: r,
        terrainColor: null,
        icon: null,
        factionId: null
    };
    data.hexes[key] = newHex;
    return newHex;
}

export function setHex(data: HexerData, hex: Hexagon): void {
    data.hexes[hexKey(hex.q, hex.r)] = hex;
}

export function deleteHex(data: HexerData, coordinates: AxialCoordinates): void;
export function deleteHex(data: HexerData, q: number, r: number): void;
export function deleteHex(data: HexerData, arg1: AxialCoordinates | number, arg2?: number): void {
    const q = typeof arg1 === 'object' ? arg1.q : arg1;
    const r = typeof arg1 === 'object' ? arg1.r : arg2!;
    delete data.hexes[hexKey(q, r)];
}

/**
 * Persists a hexagon after an erase: an empty hexagon is removed from the map
 * entirely, otherwise it is written back with its remaining properties.
 */
export function eraseIfEmpty(data: HexerData, hex: Hexagon): void {
    if(hexagonIsEmpty(hex)) {
        deleteHex(data, hex.q, hex.r);
    }
    else {
        setHex(data, hex);
    }
}

/**
 * Converts a hex coordinate to its layout point using the map's size and
 * orientation. Callers never restate the orientation, so a pointy-top map
 * can't silently be laid out as flat-top.
 */
export function hexToPoint(data: HexerData, coordinate: AxialCoordinates): Point {
    return axialCoordinatesToPoint(coordinate, data.size, data.mapSettings.hexOrientation);
}

/**
 * Converts a layout point back to the hex coordinate under it, using the map's
 * size and orientation. The inverse of {@link hexToPoint}.
 */
export function pointToHex(data: HexerData, x: number, y: number): AxialCoordinates {
    return pointToAxialCoordinates(x, y, data.size, data.mapSettings.hexOrientation);
}

export const CURRENT_VERSION = '1.0';
export const initialFileContent =
`---
hexer:
  version: "${CURRENT_VERSION}"
  mapSettings:
    name: ""
    hexOrientation: "flat-top"
    displayHexBorders: true
    displayCrosshair: true
  camera:
    offset:
      x: 0
      y: 0
    zoom: 1
  size: 50
  hexes: {}
  rivers: []
  roads: []
  factions: []
---
`;
