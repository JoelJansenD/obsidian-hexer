import { pointToRadialCoordinates, roundRadialCoordinates } from "./hexagon";

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