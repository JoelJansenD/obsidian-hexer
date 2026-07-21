import { Hexagon } from "../logic/hexagon";
import { HexerData, HexerState } from "../logic/HexerData";
import { fromFrontmatter, toFrontmatter } from "./frontmatter";

const emptyState = (): HexerState => ({ version: '1.0', size: 50, hexes: new Map<string, Hexagon>() });

describe('toFrontmatter', () => {
    it('converts HexerData to frontmatter correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null });

        // Act
        const frontmatter = toFrontmatter(data);

        // Assert
        expect(frontmatter.hexer).toEqual({
            version: '1.0',
            size: 50,
            hexes: { '0,0': { q: 0, r: 0, terrainColor: '#ff0000', icon: null } },
        });
    });
});

describe('frontmatter round-trip', () => {
    it('survives structured serialization to a plain object and back', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null });
        data.setHex({ q: 1, r: 2, terrainColor: '#00ff00', icon: null });

        // Act - mimic the on-disk write/read cycle. A Map serializes to {},
        // so this fails unless toFrontmatter emits a plain object.
        const serialized = JSON.parse(JSON.stringify(toFrontmatter(data)));
        const restored = fromFrontmatter(serialized);

        // Assert
        expect(restored.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null });
        expect(restored.getHex(1, 2)).toEqual({ q: 1, r: 2, terrainColor: '#00ff00', icon: null });
        expect(restored.size).toBe(50);
        expect(restored.version).toBe('1.0');
    });
});

describe('fromFrontmatter', () => {
    it('converts frontmatter to HexerData correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null });
        const frontmatter = toFrontmatter(data);

        // Act
        const newData = fromFrontmatter(frontmatter);

        // Assert
        expect(newData.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null });
    });
});
