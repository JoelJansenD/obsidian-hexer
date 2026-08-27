import { DEFAULT_ZOOM, defaultCamera } from "./camera";

describe('defaultCamera', () => {
    it('starts centred and unscaled', () => {
        // Act
        const camera = defaultCamera();

        // Assert
        expect(camera).toEqual({ offset: { x: 0, y: 0 }, zoom: DEFAULT_ZOOM });
    });
});
