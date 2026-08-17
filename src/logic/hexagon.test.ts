import { getArea, getNeighbours, Hexagon, hexagonIsEmpty, pointToRadialCoordinates, RadialCoordinates, radialCoordinatesToPoint, roundRadialCoordinates } from "./hexagon";

describe('getArea', () => {
    const key = (q: number, r: number) => `${q},${r}`;
    const matchesColour = (hexMap: Map<string, Hexagon>, colour: string | null) =>
        (hex: RadialCoordinates) => {
            const found = hexMap.get(key(hex.q, hex.r));
            return found !== undefined && found.terrainColor === colour;
        };

    it('returns all connected hexes sharing the same terrain colour', () => {
        // Arrange
        const hexMap = new Map<string, Hexagon>([
            [key(0, 0), { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null }],
            [key(0, 1), { q: 0, r: 1, terrainColor: '#ff0000', icon: null, factionId: null }],
            [key(1, 0), { q: 1, r: 0, terrainColor: '#ff0000', icon: null, factionId: null }],
            [key(2, 0), { q: 2, r: 0, terrainColor: '#ff0000', icon: null, factionId: null }],
        ]);

        // Act
        const result = getArea({ q: 0, r: 0 }, matchesColour(hexMap, '#ff0000'));

        // Assert
        expect(result).toHaveLength(4);
        expect(result).toEqual(expect.arrayContaining([
            { q: 0, r: 0 },
            { q: 0, r: 1 },
            { q: 1, r: 0 },
            { q: 2, r: 0 },
        ]));
    });

    it('returns all connected hexes sharing a null terrain colour', () => {
        // Arrange
        const hexMap = new Map<string, Hexagon>([
            [key(0, 0), { q: 0, r: 0, terrainColor: null, icon: null, factionId: null }],
            [key(0, 1), { q: 0, r: 1, terrainColor: null, icon: null, factionId: null }],
            [key(1, 0), { q: 1, r: 0, terrainColor: null, icon: null, factionId: null }],
        ]);

        // Act
        const result = getArea({ q: 0, r: 0 }, matchesColour(hexMap, null));

        // Assert
        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining([
            { q: 0, r: 0 },
            { q: 0, r: 1 },
            { q: 1, r: 0 },
        ]));
    });

    it('returns only the clicked hex when no neighbours match', () => {
        // Arrange
        const hexMap = new Map<string, Hexagon>([
            [key(0, 0), { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null }],
            // A neighbour with a different terrain colour is not included.
            [key(0, 1), { q: 0, r: 1, terrainColor: '#0000ff', icon: null, factionId: null }],
            // The remaining neighbours are missing from the map entirely.
        ]);

        // Act
        const result = getArea({ q: 0, r: 0 }, matchesColour(hexMap, '#ff0000'));

        // Assert
        expect(result).toEqual([{ q: 0, r: 0 }]);
    });
});

describe('getNeighbours', () => {
    it('returns the correct neighbours for a given hex', () => {
        // Arrange
        const coordinates = { q: 12, r: 21 };
        // Act
        const result = getNeighbours(coordinates);

        // Assert
        expect(result).toEqual([
            { q: 12, r: 22 }, // North
            { q: 13, r: 21 }, // North-East
            { q: 13, r: 20 }, // South-East
            { q: 12, r: 20 }, // South
            { q: 11, r: 21 }, // South-West
            { q: 11, r: 22 }  // North-West
        ]);
    });
});

describe('hexagonIsEmpty', () => {
    it('returns true when no fields have values', () => {
        // Arrange
        const hexagon: Hexagon = {
            q: 0,
            r: 0,
            terrainColor: null,
            icon: null,
            factionId: null
        };
        // Act
        const result = hexagonIsEmpty(hexagon);

        // Assert
        expect(result).toBe(true);
    });

    it('returns false when terrainColor has a value', () => {
        // Arrange
        const hexagon: Hexagon = {
            q: 0,
            r: 0,
            terrainColor: '#ff0000',
            icon: null,
            factionId: null
        };

        // Act
        const result = hexagonIsEmpty(hexagon);

        // Assert
        expect(result).toBe(false);
    });

    it('returns false when icon has a value', () => {
        // Arrange
        const hexagon: Hexagon = {
            q: 0,
            r: 0,
            terrainColor: null,
            icon: { name: 'test-icon', color: '#00ff00' },
            factionId: null
        };

        // Act
        const result = hexagonIsEmpty(hexagon);

        // Assert
        expect(result).toBe(false);
    });

    it('returns false when factionId has a value', () => {
        // Arrange
        const hexagon: Hexagon = {
            q: 0,
            r: 0,
            terrainColor: null,
            icon: null,
            factionId: 'faction-1'
        };

        // Act
        const result = hexagonIsEmpty(hexagon);

        // Assert
        expect(result).toBe(false);
    });
});

describe('pointToRadialCoordinates', () => {
    it.for([
        [ 0, 0, 0, 0 ],
        [ 15, 8.660254, 10, 0 ],
        [ 0, 17.320508, 0, 10 ],
        [ -15, 8.660254, -10, 10 ],
    ])('converts point (%d, %d) to radial coordinates (%i, %i)', ([x, y, q, r]) => {
        // Arrange
        const size = 1;

        // Act
        const result = pointToRadialCoordinates(x, y, size);

        // Assert
        expect(result.q).toBe(q);
        expect(result.r).toBe(r);
    });

    it('scales before converting', () => {
        // Arrange
        const x = 15;
        const y = 8.660254;
        const size = 5;

        // Act
        const result = pointToRadialCoordinates(x, y, size);

        // Assert
        expect(result.q).toBe(2);
        expect(result.r).toBe(0);
    });
});

describe('radialCoordinatesToPoint', () => {
    it.for([
        [ 0, 0, 0, 0 ],
        [ 10, 0, 15, 8.660254 ],
        [ 0, 10, 0, 17.320508 ],
        [ -10, 10, -15, 8.660254 ],
    ])('converts radial coordinates (%d, %d) to point (%d, %d)', ([ q, r, expectedX, expectedY ]) => {
        // Arrange
        const size = 1;

        // Act
        const result = radialCoordinatesToPoint({ q, r }, size);

        // Assert
        expect(result.x).toBeCloseTo(expectedX);
        expect(result.y).toBeCloseTo(expectedY);
    });

    it('scales after converting', () => {
        // Arrange
        const size = 5;

        // Act
        const result = radialCoordinatesToPoint({ q: 0, r: 10 }, size);

        // Assert
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(86.60254);
    });
});

describe('roundRadialCoordinates', () => {
    it.for([
        [ 1.6, 2.1, 2, 2 ],
        [ 2.1, 1.6, 2, 2 ],
        [ 2.1, 2.1, 2, 2 ]
    ])('rounds (%d, %d) to (%i, %i)', ([ q, r, expectedQ, expectedR ]) => {
        // Act
        const result = roundRadialCoordinates(q, r);

        // Assert
        expect(result.q).toBe(expectedQ);
        expect(result.r).toBe(expectedR);
    });

    it('rounds negative values correctly', () => {
        // Act
        const result = roundRadialCoordinates(-1.6, -2.1);

        // Assert
        expect(result.q).toBe(-2);
        expect(result.r).toBe(-2);
    });

    it('rounds negative values close to zero to zero', () => {
        // Act
        const result = roundRadialCoordinates(-1e-9, -1e-9);

        // Assert
        expect(result.q).toBe(0);
        expect(result.r).toBe(0);
    });
});
