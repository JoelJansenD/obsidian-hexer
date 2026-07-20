export interface RadialCoordinates {
    q: number;
    r: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Hexagon extends RadialCoordinates {
    terrainColor: string | null;
};

export function hexagonIsEmpty(hexagon: Hexagon) {
    return hexagon.terrainColor === null;
}

export function pointToRadialCoordinates(x: number, y: number, size: number) {
    const scaledX = x / size;
    const scaledY = y / size;

    const q = (2 / 3) * scaledX;
    const r = (-1 / 3) * scaledX + (Math.sqrt(3) / 3) * scaledY;

    return roundRadialCoordinates(q, r);
}

export function radialCoordinatesToPoint(coordinate: RadialCoordinates, size: number) : Point {
    const x = size * ((3 / 2) * coordinate.q);
    const y = size * (((Math.sqrt(3) / 2) * coordinate.q) + (Math.sqrt(3) * coordinate.r));
    return { x, y };
}

export function roundRadialCoordinates(coordinates: RadialCoordinates) : RadialCoordinates;
export function roundRadialCoordinates(q: number, r: number): RadialCoordinates;
export function roundRadialCoordinates(arg1: number | RadialCoordinates, arg2?: number) {
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