import { defaultCamera } from "./camera";
import { Hexagon } from "./hexagon";
import { HexerData, HexerState } from "./HexerData";
import { defaultMapSettings } from "./mapSettings";

const emptyState = (): HexerState => ({ version: '1.0', size: 50, hexes: new Map<string, Hexagon>(), rivers: [], roads: [], factions: [], mapSettings: defaultMapSettings(), camera: defaultCamera() });

describe('HexerData', () => {
    it('constructor applies the provided state', () => {
        // Arrange
        const initial: HexerState = {
            version: '1.0',
            size: 50,
            hexes: new Map([
                ['0,0', { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null }],
                ['1,1', { q: 1, r: 1, terrainColor: '#0000ff', icon: null, factionId: null }],
            ]),
            rivers: [],
            roads: [],
            factions: [],
            mapSettings: defaultMapSettings(),
            camera: defaultCamera(),
        };

        // Act
        const result = new HexerData(initial);

        // Assert
        expect(result).toEqual(initial);
    });

    it('getHex returns the correct hex data', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const hex = data.getHex(0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getHex returns the correct hex data when provided with coordinates', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const hex = data.getHex({ q: 0, r: 0 });

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getHex returns undefined for non-existent hex', () => {
        // Arrange
        const data = new HexerData(emptyState());

        // Act
        const hex = data.getHex(1, 1);

        // Assert
        expect(hex).toBeUndefined();
    });

    it('setHex adds new hex data correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());

        // Act
        data.setHex({ q: 1, r: 1, terrainColor: '#0000ff', icon: null, factionId: null });
        const hex = data.getHex(1, 1);

        // Assert
        expect(hex).toEqual({ q: 1, r: 1, terrainColor: '#0000ff', icon: null, factionId: null });
    });

    it('setHex updates the hex data correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        data.setHex({ q: 0, r: 0, terrainColor: '#00ff00', icon: null, factionId: null });
        const hex = data.getHex(0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#00ff00', icon: null, factionId: null });
    });

    it('getOrCreateHex returns the existing hex without altering it', () => {
        // Arrange
        const data = new HexerData(emptyState());
        const existing: Hexagon = { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null };
        data.setHex(existing);

        // Act
        const hex = data.getOrCreateHex({ q: 0, r: 0 });

        // Assert
        expect(hex).toBe(existing);
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });

    it('getOrCreateHex creates and stores a new empty hex when none exists', () => {
        // Arrange
        const data = new HexerData(emptyState());

        // Act
        const hex = data.getOrCreateHex({ q: 1, r: 1 });

        // Assert
        expect(hex).toEqual({ q: 1, r: 1, terrainColor: null, icon: null, factionId: null });
        expect(data.getHex(1, 1)).toBe(hex);
    });

    it('eraseIfEmpty removes the hex from the map when it is empty', () => {
        // Arrange
        const data = new HexerData(emptyState());
        const hex: Hexagon = { q: 0, r: 0, terrainColor: null, icon: null, factionId: null };
        data.setHex(hex);

        // Act
        data.eraseIfEmpty(hex);

        // Assert
        expect(data.getHex(0, 0)).toBeUndefined();
    });

    it('eraseIfEmpty persists the hex when it still has content', () => {
        // Arrange
        const data = new HexerData(emptyState());
        const hex: Hexagon = { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null };

        // Act
        data.eraseIfEmpty(hex);

        // Assert
        expect(data.getHex(0, 0)).toBe(hex);
    });

    describe('hexToPoint / pointToHex', () => {
        it('hexToPoint converts using the map size and its flat-top orientation', () => {
            // Arrange
            const data = new HexerData({ ...emptyState(), size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const point = data.hexToPoint({ q: 10, r: 0 });

            // Assert
            expect(point.x).toBeCloseTo(15);
            expect(point.y).toBeCloseTo(8.660254);
        });

        it('hexToPoint converts using the map size and its pointy-top orientation', () => {
            // Arrange
            const data = new HexerData({ ...emptyState(), size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'pointy-top' } });

            // Act
            const point = data.hexToPoint({ q: 10, r: 0 });

            // Assert
            expect(point.x).toBeCloseTo(17.320508);
            expect(point.y).toBeCloseTo(0);
        });

        it('pointToHex converts using the map size and its flat-top orientation', () => {
            // Arrange
            const data = new HexerData({ ...emptyState(), size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const hex = data.pointToHex(15, 8.660254);

            // Assert
            expect(hex).toEqual({ q: 10, r: 0 });
        });

        it('pointToHex converts using the map size and its pointy-top orientation', () => {
            // Arrange
            const data = new HexerData({ ...emptyState(), size: 1, mapSettings: { ...defaultMapSettings(), hexOrientation: 'pointy-top' } });

            // Act
            const hex = data.pointToHex(17.320508, 0);

            // Assert
            expect(hex).toEqual({ q: 10, r: 0 });
        });

        it('hexToPoint scales by the map size', () => {
            // Arrange
            const data = new HexerData({ ...emptyState(), size: 5, mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top' } });

            // Act
            const point = data.hexToPoint({ q: 0, r: 10 });

            // Assert
            expect(point.x).toBeCloseTo(0);
            expect(point.y).toBeCloseTo(86.60254);
        });
    });
});
