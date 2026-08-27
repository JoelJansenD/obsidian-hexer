import { DEFAULT_ZOOM, defaultCamera, normalizeCamera } from "./camera";

describe('defaultCamera', () => {
    it('starts centred and unscaled', () => {
        // Act
        const camera = defaultCamera();

        // Assert
        expect(camera).toEqual({ offset: { x: 0, y: 0 }, zoom: 1 });
    });
});

describe('normalizeCamera', () => {
    it('defaults a missing zoom to unscaled (pre-zoom documents)', () => {
        // Arrange
        const stored = { offset: { x: 10, y: -5 } };

        // Act
        const normalized = normalizeCamera(stored);

        // Assert
        expect(normalized).toEqual({ offset: { x: 10, y: -5 }, zoom: DEFAULT_ZOOM });
    });

    it('leaves an existing zoom untouched', () => {
        // Arrange
        const camera = { offset: { x: 0, y: 0 }, zoom: 2.5 };

        // Act
        const normalized = normalizeCamera(camera);

        // Assert
        expect(normalized).toEqual({ offset: { x: 0, y: 0 }, zoom: 2.5 });
    });
});
