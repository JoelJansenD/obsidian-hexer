import createHexerData from "../__test/createHexerData";
import { setHex, hexToPoint } from "./HexerData";
import { addNode, createPath } from "./path";
import {
    Camera,
    DEFAULT_ZOOM,
    MAX_ZOOM,
    MIN_ZOOM,
    defaultCamera,
    fitCamera,
    mapToScreen,
    panCamera,
    screenToMap,
    zoomCameraAt,
} from "./camera";

describe('defaultCamera', () => {
    it('starts centred and unscaled', () => {
        // Act
        const camera = defaultCamera();

        // Assert
        expect(camera).toEqual({ offset: { x: 0, y: 0 }, zoom: DEFAULT_ZOOM });
    });
});

describe('mapToScreen', () => {
    it('draws the camera centre point at the viewport centre', () => {
        // Arrange
        const camera: Camera = { offset: { x: 200, y: -50 }, zoom: 1 };

        // Act
        const screen = mapToScreen(camera, 800, 600, { x: 200, y: -50 });

        // Assert
        expect(screen).toEqual({ x: 400, y: 300 });
    });

    it('scales map distances from the centre by the zoom', () => {
        // Arrange - zoom 2 draws a 50 map-unit offset as 100 screen px.
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 2 };

        // Act
        const screen = mapToScreen(camera, 800, 600, { x: 50, y: 0 });

        // Assert
        expect(screen).toEqual({ x: 500, y: 300 });
    });

    it('inverts screenToMap exactly at any pan and zoom', () => {
        // Arrange
        const camera: Camera = { offset: { x: 17, y: -42 }, zoom: 0.35 };
        const mapPoint = { x: 123, y: -456 };

        // Act
        const roundTripped = screenToMap(camera, 1024, 768, mapToScreen(camera, 1024, 768, mapPoint));

        // Assert
        expect(roundTripped.x).toBeCloseTo(mapPoint.x, 9);
        expect(roundTripped.y).toBeCloseTo(mapPoint.y, 9);
    });
});

describe('screenToMap', () => {
    it('maps the viewport centre to the camera centre point', () => {
        // Arrange
        const camera: Camera = { offset: { x: 200, y: -50 }, zoom: 1 };

        // Act
        const mapPoint = screenToMap(camera, 800, 600, { x: 400, y: 300 });

        // Assert
        expect(mapPoint).toEqual({ x: 200, y: -50 });
    });

    it('undoes the zoom around the viewport centre', () => {
        // Arrange - zoom 2 halves the screen distance in map space.
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 2 };

        // Act
        const mapPoint = screenToMap(camera, 800, 600, { x: 500, y: 300 });

        // Assert - 100px right of centre at 2x is 50 map units right.
        expect(mapPoint).toEqual({ x: 50, y: 0 });
    });
});

describe('panCamera', () => {
    it('moves the centre opposite the drag so the scene follows the cursor', () => {
        // Arrange
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 1 };

        // Act - drag 100px right and 60px down.
        const panned = panCamera(camera, { x: 100, y: 60 });

        // Assert - the camera now looks up-and-left, so the scene shifts down-and-right.
        expect(panned).toEqual({ offset: { x: -100, y: -60 }, zoom: 1 });
    });

    it('scales the drag into map units by the zoom', () => {
        // Arrange
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 2 };

        // Act
        const panned = panCamera(camera, { x: 100, y: 60 });

        // Assert - at 2x, 100 screen px is 50 map units.
        expect(panned).toEqual({ offset: { x: -50, y: -30 }, zoom: 2 });
    });
});

describe('zoomCameraAt', () => {
    it('steps the zoom by 1.1 per notch', () => {
        // Arrange
        const camera = defaultCamera();

        // Act - one notch in, anchored at the viewport centre.
        const zoomed = zoomCameraAt(camera, { x: 400, y: 300 }, 1, 800, 600);

        // Assert
        expect(zoomed.zoom).toBeCloseTo(1.1, 9);
        // Anchored at centre, the centre point does not move.
        expect(zoomed.offset).toEqual({ x: 0, y: 0 });
    });

    it('keeps the map point under the cursor fixed while zooming', () => {
        // Arrange - default camera, pointer 200px right of the 800x600 centre.
        const camera = defaultCamera();
        const cursor = { x: 600, y: 300 };
        const anchorBefore = screenToMap(camera, 800, 600, cursor);

        // Act
        const zoomed = zoomCameraAt(camera, cursor, 1, 800, 600);

        // Assert - the same map point is still under the cursor.
        const anchorAfter = screenToMap(zoomed, 800, 600, cursor);
        expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 9);
        expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 9);
    });

    it('clamps at the 5x maximum', () => {
        // Arrange
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: MAX_ZOOM };

        // Act
        const zoomed = zoomCameraAt(camera, { x: 400, y: 300 }, 1, 800, 600);

        // Assert
        expect(zoomed.zoom).toBe(MAX_ZOOM);
    });

    it('clamps at the 0.2x minimum when zooming out from a normal zoom', () => {
        // Arrange
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: MIN_ZOOM };

        // Act
        const zoomed = zoomCameraAt(camera, { x: 400, y: 300 }, -1, 800, 600);

        // Assert
        expect(zoomed.zoom).toBe(MIN_ZOOM);
    });

    it('lets the wheel zoom back in from below the minimum but never further out', () => {
        // Arrange - a fitted zoom below the 0.2x floor (e.g. an oversized map).
        const camera: Camera = { offset: { x: 0, y: 0 }, zoom: 0.1 };

        // Act & Assert - zooming out is blocked at the current level.
        expect(zoomCameraAt(camera, { x: 400, y: 300 }, -1, 800, 600).zoom).toBe(0.1);
        // Zooming in is allowed.
        expect(zoomCameraAt(camera, { x: 400, y: 300 }, 1, 800, 600).zoom).toBeCloseTo(0.11, 9);
    });
});

describe('fitCamera', () => {
    it('resets to the default camera on an empty map', () => {
        // Arrange
        const data = createHexerData({ camera: { offset: { x: 123, y: 456 }, zoom: 3 } });

        // Act
        const fitted = fitCamera(data, 800, 600);

        // Assert
        expect(fitted).toEqual(defaultCamera());
    });

    it('centres on the content and fits it with padding', () => {
        // Arrange - a single hex at the origin, size 50, in an 800x600 viewport.
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const fitted = fitCamera(data, 800, 600);

        // Assert - centred on the hex; content is 200x200 map px (±size + size pad),
        // so height binds: 600 / 200 = 3x.
        expect(fitted.offset).toEqual({ x: 0, y: 0 });
        expect(fitted.zoom).toBeCloseTo(3, 9);
    });

    it('does not zoom past 5x for tiny content', () => {
        // Arrange - one hex in a large viewport would fit far above 5x.
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const fitted = fitCamera(data, 8000, 6000);

        // Assert
        expect(fitted.zoom).toBe(MAX_ZOOM);
    });

    it('drops below the 0.2x floor rather than clip an oversized map', () => {
        // Arrange - a single hex (200x200 map px with padding) in a tiny viewport.
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const fitted = fitCamera(data, 40, 30);

        // Assert - 30 / 200 = 0.15, below 0.2 and not clamped up.
        expect(fitted.zoom).toBeCloseTo(0.15, 9);
    });

    it('frames every hex and path node within the viewport', () => {
        // Arrange - hexes and a river spread across a wide area.
        const data = createHexerData();
        setHex(data, { q: -3, r: 2, terrainColor: '#ff0000', icon: null, factionId: null });
        setHex(data, { q: 5, r: -1, terrainColor: '#00ff00', icon: null, factionId: null });
        const river = createPath('River 1');
        addNode(river, { q: 8, r: 4 });
        addNode(river, { q: -6, r: -5 });
        data.rivers.push(river);

        const vw = 800;
        const vh = 600;

        // Act
        const fitted = fitCamera(data, vw, vh);

        // Assert - project each content point to screen; all land inside the viewport.
        const toScreen = (p: { x: number, y: number }) => ({
            x: vw / 2 + fitted.zoom * (p.x - fitted.offset.x),
            y: vh / 2 + fitted.zoom * (p.y - fitted.offset.y),
        });
        const contentPoints = [
            ...Object.values(data.hexes).map(hex => hexToPoint(data, hex)),
            ...data.rivers.flatMap(path => Object.values(path.nodes).map(node => hexToPoint(data, node))),
        ];
        for (const point of contentPoints) {
            const screen = toScreen(point);
            expect(screen.x).toBeGreaterThanOrEqual(0);
            expect(screen.x).toBeLessThanOrEqual(vw);
            expect(screen.y).toBeGreaterThanOrEqual(0);
            expect(screen.y).toBeLessThanOrEqual(vh);
        }
    });
});
