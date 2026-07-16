import { fromFrontmatter, HexerData, HexerState, toFrontmatter } from "./HexerData";

const emptyState = (): HexerState => ({ version: '1.0', hexes: new Map() });

describe('HexerData', () => {
    it('constructor applies the provided state', () => {
        // Arrange
        const state: HexerState = {
            version: '1.0',
            hexes: new Map([
                ['0,0', { q: 0, r: 0, terrainColor: '#ff0000' }],
                ['1,1', { q: 1, r: 1, terrainColor: '#0000ff' }],
            ]),
        };

        // Act
        const data = new HexerData(state);

        // Assert
        expect({ version: data.version, hexes: data.hexes }).toEqual(state);
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

describe('toFrontmatter', () => {
    it('converts HexerData to frontmatter correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());

        // Act
        const frontmatter = toFrontmatter(data);

        // Assert
        expect(frontmatter.hexer).toBe(data);
    });
});

describe('fromFrontmatter', () => {
    it('converts frontmatter to HexerData correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000' });
        const frontmatter = toFrontmatter(data);

        // Act
        const newData = fromFrontmatter(frontmatter);

        // Assert
        expect(newData.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000' });
    });
});