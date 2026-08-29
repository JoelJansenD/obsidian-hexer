import { Camera } from "./camera";
import { CameraStrategy } from "./CameraStrategy";

const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;
const RIGHT_BUTTON = 2;

const centredCamera: Camera = { offset: { x: 0, y: 0 }, zoom: 1 };

describe('beginPan', () => {
    it('starts a pan on the middle button', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Act
        const began = strategy.beginPan(MIDDLE_BUTTON, { x: 0, y: 0 });

        // Assert
        expect(began).toBe(true);
        expect(strategy.isPanning).toBe(true);
    });

    it('starts a pan on the left button while Space is held', () => {
        // Arrange
        const strategy = new CameraStrategy();
        strategy.setSpaceHeld(true);

        // Act
        const began = strategy.beginPan(LEFT_BUTTON, { x: 0, y: 0 });

        // Assert
        expect(began).toBe(true);
        expect(strategy.isPanning).toBe(true);
    });

    it('does not pan on the left button without Space', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Act
        const began = strategy.beginPan(LEFT_BUTTON, { x: 0, y: 0 });

        // Assert
        expect(began).toBe(false);
        expect(strategy.isPanning).toBe(false);
    });

    it('does not pan on the right button', () => {
        // Arrange
        const strategy = new CameraStrategy();
        strategy.setSpaceHeld(true);

        // Act
        const began = strategy.beginPan(RIGHT_BUTTON, { x: 0, y: 0 });

        // Assert
        expect(began).toBe(false);
    });
});

describe('pan', () => {
    it('returns null when no pan is underway', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Act & Assert
        expect(strategy.pan(centredCamera, { x: 10, y: 10 })).toBeNull();
    });

    it('moves the camera by the drag since the press', () => {
        // Arrange
        const strategy = new CameraStrategy();
        strategy.beginPan(MIDDLE_BUTTON, { x: 10, y: 10 });

        // Act - drag 100 right, 60 down.
        const panned = strategy.pan(centredCamera, { x: 110, y: 70 });

        // Assert - the centre moves opposite the drag (zoom 1).
        expect(panned).toEqual({ offset: { x: -100, y: -60 }, zoom: 1 });
    });

    it('pans by each move delta, advancing the tracked pointer', () => {
        // Arrange
        const strategy = new CameraStrategy();
        strategy.beginPan(MIDDLE_BUTTON, { x: 10, y: 10 });
        const afterFirst = strategy.pan(centredCamera, { x: 110, y: 70 })!;

        // Act - a second move of 10,10 from the previous pointer, not the press.
        const afterSecond = strategy.pan(afterFirst, { x: 120, y: 80 });

        // Assert
        expect(afterSecond).toEqual({ offset: { x: -110, y: -70 }, zoom: 1 });
    });
});

describe('endPan', () => {
    it('stops the pan so later moves are ignored', () => {
        // Arrange
        const strategy = new CameraStrategy();
        strategy.beginPan(MIDDLE_BUTTON, { x: 0, y: 0 });

        // Act
        strategy.endPan();

        // Assert
        expect(strategy.isPanning).toBe(false);
        expect(strategy.pan(centredCamera, { x: 50, y: 50 })).toBeNull();
    });
});

describe('cursor', () => {
    it('is none when idle, pan-armed when Space arms a pan, panning mid-pan', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Assert - idle.
        expect(strategy.cursor).toBeNull();

        // Act & Assert - Space arms a pan.
        strategy.setSpaceHeld(true);
        expect(strategy.cursor).toBe('pan-armed');

        // Act & Assert - pan in progress.
        strategy.beginPan(LEFT_BUTTON, { x: 0, y: 0 });
        expect(strategy.cursor).toBe('panning');
    });
});

describe('zoom', () => {
    it('zooms in when the wheel scrolls up (negative delta)', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Act
        const zoomed = strategy.zoom(centredCamera, { x: 400, y: 300 }, -100, { width: 800, height: 600 });

        // Assert
        expect(zoomed.zoom).toBeCloseTo(1.1, 9);
    });

    it('zooms out when the wheel scrolls down (positive delta)', () => {
        // Arrange
        const strategy = new CameraStrategy();

        // Act
        const zoomed = strategy.zoom(centredCamera, { x: 400, y: 300 }, 100, { width: 800, height: 600 });

        // Assert
        expect(zoomed.zoom).toBeCloseTo(1 / 1.1, 9);
    });
});
