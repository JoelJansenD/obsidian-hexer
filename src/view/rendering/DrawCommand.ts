export interface FillPolygon {
    readonly type: 'fill-polygon';
    readonly points: ReadonlyArray<readonly [number, number]>;
    readonly color: string;
}

export type DrawCommand = FillPolygon;
