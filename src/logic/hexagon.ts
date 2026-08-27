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