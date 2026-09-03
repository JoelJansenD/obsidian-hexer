import { hexKey } from "./HexerData";
import { Icon } from "./icon";
import { HexOrientation } from "./mapSettings";

export interface AxialCoordinates {
    q: number;
    r: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Hexagon extends AxialCoordinates {
    terrainColor: string | null;
    icon: Icon | null;
    factionId: string | null;
};

export function getArea(coordinates: AxialCoordinates, predicate: (hex: AxialCoordinates) => boolean) {
    const result: AxialCoordinates[] = [];
    const visited = new Set<string>();
    const stack: AxialCoordinates[] = [coordinates];

    while(stack.length > 0) {
        const current = stack.pop()!;
        const key = hexKey(current.q, current.r);
        if(visited.has(key)) {
            continue;
        }

        visited.add(key);

        if(predicate(current)) {
            result.push(current);
            const neighbours = getNeighbours(current);
            stack.push(...neighbours);
        }
    }

    return result;
}

export function getNeighbours(coordinates: AxialCoordinates): AxialCoordinates[] {
    const modifiers = [
        { q: 0, r: 1 }, // North
        { q: 1, r: 0 }, // North-East
        { q: 1, r: -1 }, // South-East
        { q: 0, r: -1 }, // South
        { q: -1, r: 0 }, // South-West
        { q: -1, r: 1 }  // North-West
    ];

    const add = (coord: AxialCoordinates, mod: AxialCoordinates): AxialCoordinates => ({ q: coord.q + mod.q, r: coord.r + mod.r });
    return modifiers.map(mod => add(coordinates, mod));
}

/** A hex's grid-friendly `col,row` reading, produced by {@link labelCoordinates}. */
export interface LabelCoordinates {
    col: number;
    row: number;
}

/**
 * The `col,row` pair a hex reads as in a grid-friendly view of its axial
 * coordinate. Axial `q,r` is the map's internal model (ADR 0002), but on
 * flat-top maps stepping `q` walks a band of hexes diagonally downhill, so the
 * raw axial pair doesn't read like a grid. Converting to odd-q offset
 * coordinates re-indexes each visual (zigzag) row to a single `row` value while
 * `col` increments straight across it. Pointy-top rows are already true
 * horizontals, so their axial pair passes through unchanged.
 *
 * Drives both the coordinate label (see render.ts) and the note convention (see
 * hexNote.ts); it lives here in the logic layer rather than beside the label
 * drawing because a hex's note path now depends on it too (ADR 0013), a
 * deliberate exception to keeping display-only transforms private to render.ts.
 */
export function labelCoordinates(hex: AxialCoordinates, orientation: HexOrientation): LabelCoordinates {
    if(orientation === 'pointy-top') {
        return { col: hex.q, row: hex.r };
    }

    // odd-q offset: `q & 1` is 1 on odd columns (including negative ones), so
    // odd columns drop half a row and each zigzag row collapses to one `row`.
    return { col: hex.q, row: hex.r + (hex.q - (hex.q & 1)) / 2 };
}

export function hexagonIsEmpty(hexagon: Hexagon) {
    return hexagon.terrainColor === null
        && hexagon.icon === null
        && hexagon.factionId === null;
}

export function pointToAxialCoordinates(x: number, y: number, size: number, orientation: HexOrientation) {
    const scaledX = x / size;
    const scaledY = y / size;

    if(orientation === 'pointy-top') {
        const q = ((Math.sqrt(3) / 3) * scaledX) - ((1 / 3) * scaledY);
        const r = (2 / 3) * scaledY;
        return roundAxialCoordinates(q, r);
    }

    const q = (2 / 3) * scaledX;
    const r = (-1 / 3) * scaledX + (Math.sqrt(3) / 3) * scaledY;

    return roundAxialCoordinates(q, r);
}

export function axialCoordinatesToPoint(coordinate: AxialCoordinates, size: number, orientation: HexOrientation) : Point {
    if(orientation === 'pointy-top') {
        const x = size * ((Math.sqrt(3) * coordinate.q) + ((Math.sqrt(3) / 2) * coordinate.r));
        const y = size * ((3 / 2) * coordinate.r);
        return { x, y };
    }

    const x = size * ((3 / 2) * coordinate.q);
    const y = size * (((Math.sqrt(3) / 2) * coordinate.q) + (Math.sqrt(3) * coordinate.r));
    return { x, y };
}

export function roundAxialCoordinates(coordinates: AxialCoordinates) : AxialCoordinates;
export function roundAxialCoordinates(q: number, r: number): AxialCoordinates;
export function roundAxialCoordinates(arg1: number | AxialCoordinates, arg2?: number) {
    const q = typeof arg1 === 'number' ? arg1 : arg1.q;
    const r = typeof arg1 === 'number' ? arg2! : arg1.r;

    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
        rq = -rr - rs;
    } else if (rDiff > sDiff) {
        rr = -rq - rs;
    }

    // By default, negative numbers close to 0 (such as -1e9) round to -0
    // By adding 0, we ensure that they round to 0 instead
    return { q: rq + 0, r: rr + 0 };
}