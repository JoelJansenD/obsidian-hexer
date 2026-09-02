import createHexerData from "../__test/createHexerData";
import { Hexagon } from "../logic/hexagon";
import { Path } from "../logic/path";
import {
    computePrintBounds,
    planPrintRender,
    buildPrintData,
    MAX_PRINT_AREA,
    MAX_PRINT_DIMENSION,
    PRINT_SUPERSAMPLE,
} from "./print";

// A painted hex the crop should frame. Empty hexes (all-null) are the ones the
// crop skips, so tests spell out the difference explicitly.
const paintedHex = (q: number, r: number): Hexagon => ({ q, r, terrainColor: '#6aa84f', icon: null, factionId: null });
const emptyHex = (q: number, r: number): Hexagon => ({ q, r, terrainColor: null, icon: null, factionId: null });

const hexes = (...list: Hexagon[]): Record<string, Hexagon> =>
    Object.fromEntries(list.map(hex => [`${hex.q},${hex.r}`, hex]));

// A minimal single-node path, enough to contribute a node point to the crop.
const pathAt = (q: number, r: number): Path => ({
    id: 'p', name: 'p', color: '#ff0000', filePath: null,
    nodes: { [`${q},${r}`]: { q, r } }, edges: [],
});

describe('computePrintBounds', () => {
    it('returns null for a map with nothing drawn', () => {
        expect(computePrintBounds(createHexerData())).toBeNull();
    });

    it('frames a single hex by its corners plus an edge margin, not its centre', () => {
        // Flat-top, size 50 at 0,0: corners span x[-50,50], y[-43.3,43.3]. The
        // margin (size * 0.24 = 12) grows the box past the corners, wide enough to
        // clear a wavy path edge (see PRINT_EDGE_MARGIN_SCALE).
        const bounds = computePrintBounds(createHexerData({ size: 50, hexes: hexes(paintedHex(0, 0)) }))!;

        expect(bounds.minX).toBeCloseTo(-62);
        expect(bounds.maxX).toBeCloseTo(62);
        expect(bounds.minY).toBeCloseTo(-55.301);
        expect(bounds.maxY).toBeCloseTo(55.301);
    });

    it('ignores empty hexes so a stray blank cell never pads the crop', () => {
        const withBlank = computePrintBounds(createHexerData({
            size: 50,
            hexes: hexes(paintedHex(0, 0), emptyHex(5, 0)),
        }))!;
        const painted = computePrintBounds(createHexerData({ size: 50, hexes: hexes(paintedHex(0, 0)) }))!;

        expect(withBlank).toEqual(painted);
    });

    it('includes path nodes even on a map with no hexes', () => {
        // A river node at 0,0 with no hexes still yields a (margin-sized) crop.
        const bounds = computePrintBounds(createHexerData({ size: 50, rivers: [pathAt(0, 0)] }))!;

        expect(bounds).not.toBeNull();
        expect(bounds.maxX).toBeGreaterThan(bounds.minX);
    });
});

describe('planPrintRender', () => {
    it('returns null for an empty map', () => {
        expect(planPrintRender(createHexerData())).toBeNull();
    });

    it('frames the crop at the supersample factor for a small map', () => {
        const plan = planPrintRender(createHexerData({ size: 50, hexes: hexes(paintedHex(0, 0)) }))!;

        // Small map: nothing forces a downscale, so the full supersample is used.
        expect(plan.scale).toBe(PRINT_SUPERSAMPLE);
        expect(plan.camera.zoom).toBe(1);
        // The camera centres on the crop, which is symmetric about the origin here.
        expect(plan.camera.offset.x).toBeCloseTo(0);
        expect(plan.camera.offset.y).toBeCloseTo(0);
        // The viewport equals the crop; the backing store is that times the scale.
        expect(plan.viewport.width).toBeCloseTo(124);
        expect(plan.canvasWidth).toBe(Math.round(plan.viewport.width * plan.scale));
        expect(plan.canvasHeight).toBe(Math.round(plan.viewport.height * plan.scale));
    });

    it('downscales a very wide map so no canvas side exceeds the dimension cap', () => {
        // Two path nodes far apart make the crop far wider than tall.
        const wide = createHexerData({ size: 50, rivers: [{
            id: 'p', name: 'p', color: '#ff0000', filePath: null,
            nodes: { '0,0': { q: 0, r: 0 }, '3000,0': { q: 3000, r: 0 } }, edges: [],
        }] });
        const plan = planPrintRender(wide)!;

        expect(plan.scale).toBeLessThan(PRINT_SUPERSAMPLE);
        expect(plan.canvasWidth).toBeLessThanOrEqual(MAX_PRINT_DIMENSION);
        expect(plan.canvasHeight).toBeLessThanOrEqual(MAX_PRINT_DIMENSION);
    });

    it('downscales a large near-square map so the backing store stays within the area cap', () => {
        // A single huge hex sits within the dimension cap on each side yet would
        // blow the area budget at full supersample; the area cap pulls it back.
        const huge = createHexerData({ size: 5000, hexes: hexes(paintedHex(0, 0)) });
        const plan = planPrintRender(huge)!;

        expect(plan.scale).toBeLessThan(PRINT_SUPERSAMPLE);
        // The supersampled crop — the area actually drawn — stays within the cap.
        const drawnArea = plan.scale * plan.viewport.width * (plan.scale * plan.viewport.height);
        expect(drawnArea).toBeLessThanOrEqual(MAX_PRINT_AREA);
    });
});

describe('buildPrintData', () => {
    const camera = { offset: { x: 7, y: 9 }, zoom: 1 };

    it('forces the crosshair off — a pure cursor guide never prints', () => {
        const data = createHexerData();
        data.mapSettings.displayCrosshair = true;

        expect(buildPrintData(data, camera).mapSettings.displayCrosshair).toBe(false);
    });

    it('leaves coordinate labels and grid borders following their own toggles', () => {
        const data = createHexerData();
        data.mapSettings.displayCoordinates = true;
        data.mapSettings.displayHexBorders = false;

        const printData = buildPrintData(data, camera);
        expect(printData.mapSettings.displayCoordinates).toBe(true);
        expect(printData.mapSettings.displayHexBorders).toBe(false);
    });

    it('adopts the print camera', () => {
        expect(buildPrintData(createHexerData(), camera).camera).toEqual(camera);
    });

    it('is a deep clone, so the live map is untouched', () => {
        const data = createHexerData();
        data.mapSettings.displayCrosshair = true;

        buildPrintData(data, camera);

        expect(data.mapSettings.displayCrosshair).toBe(true);
        expect(data.camera).not.toEqual(camera);
    });
});
