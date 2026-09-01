import { Hexagon } from "../logic/hexagon";
import { hexToPoint } from "../logic/HexerData";
import { defaultMapSettings } from "../logic/mapSettings";
import { createPath, addEdge } from "../logic/path";
import createHexerData from "../__test/createHexerData";
import {
    buildPrintData,
    computePrintBounds,
    MAX_PRINT_AREA,
    MAX_PRINT_DIMENSION,
    planPrintRender,
    PRINT_STROKE_MARGIN_SCALE,
    PRINT_SUPERSAMPLE,
} from "./print";
import { hexCorners } from "./render";

const filledHex = (q: number, r: number): Hexagon => ({
    q, r, terrainColor: '#ff0000', icon: null, factionId: null,
});

describe('computePrintBounds', () => {
    it('returns null for a map with no drawn geometry', () => {
        expect(computePrintBounds(createHexerData())).toBeNull();
    });

    it('ignores empty hexes that carry no terrain, icon, or faction', () => {
        const data = createHexerData({
            hexes: { '0,0': { q: 0, r: 0, terrainColor: null, icon: null, factionId: null } },
        });

        expect(computePrintBounds(data)).toBeNull();
    });

    it('frames a hex by its corners, not just its centre, plus the stroke margin', () => {
        // Arrange - one hex at the origin.
        const data = createHexerData({ hexes: { '0,0': filledHex(0, 0) } });

        // Act
        const bounds = computePrintBounds(data)!;

        // Assert - the box spans the extreme corner coordinates, grown by the margin.
        const corners = hexCorners(hexToPoint(data, { q: 0, r: 0 }), data.size, data.mapSettings.hexOrientation);
        const margin = data.size * PRINT_STROKE_MARGIN_SCALE;
        expect(bounds.minX).toBeCloseTo(Math.min(...corners.map(c => c.x)) - margin);
        expect(bounds.maxX).toBeCloseTo(Math.max(...corners.map(c => c.x)) + margin);
        expect(bounds.minY).toBeCloseTo(Math.min(...corners.map(c => c.y)) - margin);
        expect(bounds.maxY).toBeCloseTo(Math.max(...corners.map(c => c.y)) + margin);
    });

    it('extends the box to include path nodes that reach past every hex', () => {
        // Arrange - a hex at the origin and a river node far to the east.
        const river = createPath('River');
        addEdge(river, { q: 0, r: 0 }, { q: 10, r: 0 });
        const data = createHexerData({
            hexes: { '0,0': filledHex(0, 0) },
            rivers: [river],
        });

        // Act
        const bounds = computePrintBounds(data)!;

        // Assert - the far node governs the right edge.
        const farNode = hexToPoint(data, { q: 10, r: 0 });
        const margin = data.size * PRINT_STROKE_MARGIN_SCALE;
        expect(bounds.maxX).toBeCloseTo(farNode.x + margin);
    });
});

describe('planPrintRender', () => {
    it('returns null when there is nothing to frame', () => {
        expect(planPrintRender(createHexerData())).toBeNull();
    });

    it('centres the camera on the crop and frames it at zoom 1', () => {
        // Arrange
        const data = createHexerData({ hexes: { '0,0': filledHex(0, 0), '3,0': filledHex(3, 0) } });

        // Act
        const plan = planPrintRender(data)!;
        const bounds = computePrintBounds(data)!;

        // Assert - the camera looks at the crop centre; the viewport is the crop size.
        expect(plan.camera.zoom).toBe(1);
        expect(plan.camera.offset.x).toBeCloseTo((bounds.minX + bounds.maxX) / 2);
        expect(plan.camera.offset.y).toBeCloseTo((bounds.minY + bounds.maxY) / 2);
        expect(plan.viewport.width).toBeCloseTo(bounds.maxX - bounds.minX);
        expect(plan.viewport.height).toBeCloseTo(bounds.maxY - bounds.minY);
    });

    it('supersamples the backing store when the map is comfortably small', () => {
        // Arrange - a single small hex is nowhere near the dimension cap.
        const data = createHexerData({ hexes: { '0,0': filledHex(0, 0) } });

        // Act
        const plan = planPrintRender(data)!;

        // Assert
        expect(plan.scale).toBe(PRINT_SUPERSAMPLE);
        expect(plan.canvasWidth).toBe(Math.round(plan.viewport.width * PRINT_SUPERSAMPLE));
        expect(plan.canvasHeight).toBe(Math.round(plan.viewport.height * PRINT_SUPERSAMPLE));
    });

    it('downscales below the supersample factor so a very wide map lands on the dimension cap', () => {
        // Arrange - a long, thin horizontal strip (r = -q/2 keeps it flat), so the
        // width blows the dimension cap while the tiny area never touches the area cap.
        const hexes: Record<string, Hexagon> = {};
        for (let q = 0; q <= 398; q += 2) {
            hexes[`${q},${-q / 2}`] = filledHex(q, -q / 2);
        }
        const data = createHexerData({ hexes });

        // Act
        const plan = planPrintRender(data)!;

        // Assert - the widest dimension lands on the cap and the scale dropped below 3x.
        expect(plan.scale).toBeLessThan(PRINT_SUPERSAMPLE);
        expect(Math.max(plan.canvasWidth, plan.canvasHeight)).toBeLessThanOrEqual(MAX_PRINT_DIMENSION);
        expect(Math.max(plan.canvasWidth, plan.canvasHeight)).toBeGreaterThan(MAX_PRINT_DIMENSION - 2);
    });

    it('downscales a near-square map against the area cap even when both sides fit the dimension cap', () => {
        // Arrange - a large square-ish block whose sides each fit under the dimension
        // cap once scaled, but whose total area would still overrun the area cap.
        const hexes: Record<string, Hexagon> = {};
        for (let q = 0; q <= 60; q++) {
            for (let r = 0; r <= 60; r++) {
                hexes[`${q},${r}`] = filledHex(q, r);
            }
        }
        const data = createHexerData({ hexes });

        // Act
        const plan = planPrintRender(data)!;

        // Assert - the area is the binding constraint: both sides sit inside the
        // dimension cap, yet the total area is held at the area cap.
        expect(plan.scale).toBeLessThan(PRINT_SUPERSAMPLE);
        expect(Math.max(plan.canvasWidth, plan.canvasHeight)).toBeLessThan(MAX_PRINT_DIMENSION);
        expect(plan.canvasWidth * plan.canvasHeight).toBeLessThanOrEqual(Math.ceil(MAX_PRINT_AREA * 1.001));
        expect(plan.canvasWidth * plan.canvasHeight).toBeGreaterThan(MAX_PRINT_AREA * 0.98);
    });
});

describe('buildPrintData', () => {
    const printCamera = { offset: { x: 5, y: 7 }, zoom: 1 };

    it('forces the editing guides off while leaving grid borders alone', () => {
        // Arrange - borders on, guides on (the on-screen defaults).
        const data = createHexerData({
            mapSettings: { ...defaultMapSettings(), displayHexBorders: true, displayCrosshair: true, displayCoordinates: true },
        });

        // Act
        const printData = buildPrintData(data, printCamera);

        // Assert
        expect(printData.mapSettings.displayCrosshair).toBe(false);
        expect(printData.mapSettings.displayCoordinates).toBe(false);
        expect(printData.mapSettings.displayHexBorders).toBe(true);
    });

    it('keeps grid borders off when the map has them toggled off', () => {
        const data = createHexerData({
            mapSettings: { ...defaultMapSettings(), displayHexBorders: false },
        });

        expect(buildPrintData(data, printCamera).mapSettings.displayHexBorders).toBe(false);
    });

    it('adopts the print camera', () => {
        const data = createHexerData();

        expect(buildPrintData(data, printCamera).camera).toEqual(printCamera);
    });

    it('does not mutate the source map', () => {
        // Arrange
        const data = createHexerData({
            mapSettings: { ...defaultMapSettings(), displayCrosshair: true, displayCoordinates: true },
            hexes: { '0,0': filledHex(0, 0) },
        });

        // Act
        buildPrintData(data, printCamera);

        // Assert - the original still has its guides on and its own camera.
        expect(data.mapSettings.displayCrosshair).toBe(true);
        expect(data.mapSettings.displayCoordinates).toBe(true);
        expect(data.camera).not.toEqual(printCamera);
    });
});
