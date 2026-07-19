import { Hexagon } from "./hexagon";
import { HexerData, HexerState } from "./HexerData";

const emptyState = (): HexerState => ({ version: '1.0', size: 50, hexes: new Map<string, Hexagon>() });

describe('HexerData', () => {
    it('constructor applies the provided state', () => {
        // Arrange
        const initial: HexerState = {
            version: '1.0',
            size: 50,
            hexes: new Map([
                ['0,0', { q: 0, r: 0, terrainColor: '#ff0000' }],
                ['1,1', { q: 1, r: 1, terrainColor: '#0000ff' }],
            ]),
        };

        // Act
        const result = new HexerData(initial);

        // Assert
        expect(result).toEqual(initial);
    });

    it('getHex returns the correct hex data', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000' });

        // Act
        const hex = data.getHex(0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000' });
    });

    it('getHex returns the correct hex data when provided with coordinates', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000' });

        // Act
        const hex = data.getHex({ q: 0, r: 0 });

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#ff0000' });
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
        data.setHex({ q: 1, r: 1, terrainColor: '#0000ff' });
        const hex = data.getHex(1, 1);

        // Assert
        expect(hex).toEqual({ q: 1, r: 1, terrainColor: '#0000ff' });
    });

    it('setHex updates the hex data correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000' });

        // Act
        data.setHex({ q: 0, r: 0, terrainColor: '#00ff00' });
        const hex = data.getHex(0, 0);

        // Assert
        expect(hex).toEqual({ q: 0, r: 0, terrainColor: '#00ff00' });
    });
});