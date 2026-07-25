import { RadialCoordinates } from "./hexagon";

export interface Path {

}

export class Node implements RadialCoordinates {
    q: number;
    r: number;

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }
}