export interface RadialCoordinates {
    q: number;
    r: number;
}

export interface Hexagon extends RadialCoordinates {
    terrainColor: string | null;
};