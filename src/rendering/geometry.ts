/**
 * Returns the 6 corner coordinates of a flat-top regular hexagon
 * centred at (cx, cy) with the given radius.
 */
export function hexCorners(
    cx: number,
    cy: number,
    radius: number,
): ReadonlyArray<readonly [number, number]> {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i;
        return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
    });
}
