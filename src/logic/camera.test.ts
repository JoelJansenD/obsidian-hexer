import { Camera, cameraTransform, DEFAULT_ZOOM, defaultCamera } from "./camera";

describe('defaultCamera', () => {
    it('starts centred and unscaled', () => {
        // Act
        const camera = defaultCamera();

        // Assert
        expect(camera).toEqual({ offset: { x: 0, y: 0 }, zoom: DEFAULT_ZOOM });
    });
});

describe('cameraTransform', () => {
    it('draws map origin at the viewport centre for a default camera', () => {
        // Arrange
        const transform = cameraTransform(defaultCamera(), 800, 600);

        // Act & Assert
        expect(transform.origin).toEqual({ x: 400, y: 300 });
        expect(transform.scale).toBe(1);
        expect(transform.toScreen({ x: 0, y: 0 })).toEqual({ x: 400, y: 300 });
        expect(transform.toScreen({ x: 10, y: 20 })).toEqual({ x: 410, y: 320 });
    });

    it('shifts the origin by the pan offset', () => {
        // Arrange
        const camera: Camera = { offset: { x: 50, y: -30 }, zoom: 1 };

        // Act
        const transform = cameraTransform(camera, 800, 600);

        // Assert
        expect(transform.origin).toEqual({ x: 450, y: 270 });
        expect(transform.toScreen({ x: 0, y: 0 })).toEqual({ x: 450, y: 270 });
    });

    it('scales map distances by the zoom around the origin', () => {
        // Arrange - zoom 2x, centred.
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 2 };

        // Act
        const transform = cameraTransform(camera, 800, 600);

        // Assert - a point 10,20 from the origin lands twice as far out.
        expect(transform.scale).toBe(2);
        expect(transform.toScreen({ x: 10, y: 20 })).toEqual({ x: 420, y: 340 });
        expect(transform.toMap({ x: 420, y: 340 })).toEqual({ x: 10, y: 20 });
    });

    it('inverts toScreen exactly at any pan and zoom', () => {
        // Arrange
        const camera: Camera = { offset: { x: 17, y: -42 }, zoom: 0.35 };
        const transform = cameraTransform(camera, 1024, 768);
        const mapPoint = { x: 123, y: -456 };

        // Act
        const roundTripped = transform.toMap(transform.toScreen(mapPoint));

        // Assert
        expect(roundTripped.x).toBeCloseTo(mapPoint.x, 9);
        expect(roundTripped.y).toBeCloseTo(mapPoint.y, 9);
    });
});
