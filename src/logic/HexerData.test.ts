import { Hexagon } from "./hexagon";
import {
    HexerData,
    DEFAULT_ICON_PALETTE,
    DEFAULT_TERRAIN_PALETTE,
    backfillPalettes,
    eraseIfEmpty,
    getHex,
    getOrCreateHex,
    hexToPoint,
    pointToHex,
    setHex,
} from "./HexerData";
import createHexerData from "../__test/createHexerData";
import { defaultMapSettings } from "./mapSettings";

describe('HexerData', () => {
    it('getHex returns the correct hex data', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const hex = getHex(data, 0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getHex returns the correct hex data when provided with coordinates', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const hex = getHex(data, { q: 0, r: 0 });

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getHex returns undefined for non-existent hex', () => {
        // Arrange
        const data = createHexerData();

        // Act
        const hex = getHex(data, 1, 1);

        // Assert
        expect(hex).toBeUndefined();
    });

    it('setHex adds new hex data correctly', () => {
        // Arrange
        const data = createHexerData();

        // Act
        setHex(data, { q: 1, r: 1, terrainColor: '#0000ff', icon: null, factionId: null });
        const hex = getHex(data, 1, 1);

        // Assert
        expect(hex).toEqual({ q: 1, r: 1, terrainColor: '#0000ff', icon: null, factionId: null });
    });

    it('setHex updates the hex data correctly', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        setHex(data, { q: 0, r: 0, terrainColor: '#00ff00', icon: null, factionId: null });
        const hex = getHex(data, 0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#00ff00', icon: null, factionId: null });
    });

    it('getOrCreateHex returns the existing hex without altering it', () => {
        // Arrange
        const data = createHexerData();
        const existing: Hexagon = { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null };
        setHex(data, existing);

        // Act
        const hex = getOrCreateHex(data, { q: 0, r: 0 });

        // Assert
        expect(hex).toBe(existing);
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getOrCreateHex creates and stores a new empty hex when none exists', () => {
        // Arrange
        const data = createHexerData();

        // Act
        const hex = getOrCreateHex(data, { q: 1, r: 1 });

        // Assert
        expect(hex).toEqual({ q: 1, r: 1, terrainColor: null, icon: null, factionId: null });
        expect(getHex(data, 1, 1)).toBe(hex);
    });

    it('eraseIfEmpty removes the hex from the map when it is empty', () => {
        // Arrange
        const data = createHexerData();
        const hex: Hexagon = { q: 0, r: 0, terrainColor: null, icon: null, factionId: null };
        setHex(data, hex);

        // Act
        eraseIfEmpty(data, hex);

        // Assert
        expect(getHex(data, 0, 0)).toBeUndefined();
    });

    it('eraseIfEmpty persists the hex when it still has content', () => {
        // Arrange
        const data = createHexerData();
        const hex: Hexagon = { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null };

        // Act
        eraseIfEmpty(data, hex);

        // Assert
        expect(getHex(data, 0, 0)).toBe(hex);
    });

    describe('hexToPoint / pointToHex', () => {
        it('hexToPoint converts using the map size and its flat-top orientation', () => {
            // Arrange
            const data = createHexerData({ size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const point = hexToPoint(data, { q: 10, r: 0 });

            // Assert
            expect(point.x).toBeCloseTo(15);
            expect(point.y).toBeCloseTo(8.660254);
        });

        it('hexToPoint converts using the map size and its pointy-top orientation', () => {
            // Arrange
            const data = createHexerData({ size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'pointy-top' } });

            // Act
            const point = hexToPoint(data, { q: 10, r: 0 });

            // Assert
            expect(point.x).toBeCloseTo(17.320508);
            expect(point.y).toBeCloseTo(0);
        });

        it('pointToHex converts using the map size and its flat-top orientation', () => {
            // Arrange
            const data = createHexerData({ size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const hex = pointToHex(data, 15, 8.660254);

            // Assert
            expect(hex).toEqual({ q: 10, r: 0 });
        });

        it('pointToHex converts using the map size and its pointy-top orientation', () => {
            // Arrange
            const data = createHexerData({ size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'pointy-top' } });

            // Act
            const hex = pointToHex(data, 17.320508, 0);

            // Assert
            expect(hex).toEqual({ q: 10, r: 0 });
        });

        it('hexToPoint scales by the map size', () => {
            // Arrange
            const data = createHexerData({ size: 5, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const point = hexToPoint(data, { q: 0, r: 10 });

            // Assert
            expect(point.x).toBeCloseTo(0);
            expect(point.y).toBeCloseTo(86.60254);
        });
    });

    describe('backfillPalettes', () => {
        it('seeds both palettes from defaults when absent', () => {
            // Arrange - a map parsed from a pre-palette file has neither palette.
            const data = { terrainPalette: undefined, iconPalette: undefined } as unknown as HexerData;

            // Act
            backfillPalettes(data);

            // Assert
            expect(data.terrainPalette).toEqual(DEFAULT_TERRAIN_PALETTE);
            expect(data.iconPalette).toEqual(DEFAULT_ICON_PALETTE);
        });

        it('leaves stored palettes untouched', () => {
            // Arrange
            const terrainPalette = ['#111111'];
            const iconPalette = ['#222222'];
            const data = { terrainPalette, iconPalette } as unknown as HexerData;

            // Act
            backfillPalettes(data);

            // Assert
            expect(data.terrainPalette).toBe(terrainPalette);
            expect(data.iconPalette).toBe(iconPalette);
        });
    });
});
