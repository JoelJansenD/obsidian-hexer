import { Hexagon } from "../logic/hexagon";
import { HexerData, HexerState } from "../logic/HexerData";
import { Path } from "../logic/path";
import { fromFrontmatter, toFrontmatter } from "./frontmatter";

const emptyState = (): HexerState => ({ version: '1.0', size: 50, hexes: new Map<string, Hexagon>(), rivers: [], roads: [] });

describe('toFrontmatter', () => {
    it('converts HexerData to frontmatter correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const frontmatter = toFrontmatter(data);

        // Assert
        expect(frontmatter.hexer).toEqual({
            version: '1.0',
            size: 50,
            hexes: { '0,0': { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null } },
            rivers: [],
            roads: [],
        });
    });
});

describe('frontmatter round-trip', () => {
    it('survives structured serialization to a plain object and back', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        data.setHex({ q: 1, r: 2, terrainColor: '#00ff00', icon: null, factionId: null });
        
        const river = new Path("River 1");
        river.addNode({ q: 0, r: 0 });
        river.addNode({ q: 1, r: 2 });
        river.addEdge({ q: 0, r: 0 }, { q: 1, r: 2 });
        data.rivers.push(river);

        const road = new Path("Road 1");
        road.addNode({ q: 1, r: 2 });
        road.addNode({ q: 2, r: 3 });
        road.addEdge({ q: 1, r: 2 }, { q: 2, r: 3 });
        data.roads.push(road);

        // Act - mimic the on-disk write/read cycle. A Map serializes to {},
        // so this fails unless toFrontmatter emits a plain object.
        const serialized = JSON.parse(JSON.stringify(toFrontmatter(data)));
        const restored = fromFrontmatter(serialized);

        // Assert
        expect(restored.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        expect(restored.getHex(1, 2)).toEqual({ q: 1, r: 2, terrainColor: '#00ff00', icon: null, factionId: null });
        expect(restored.size).toBe(50);
        expect(restored.version).toBe('1.0');
        expect(restored.rivers.length).toBe(1);
        expect(restored.rivers[0]).toEqual(river);
        expect(restored.roads.length).toBe(1);
        expect(restored.roads[0]).toEqual(road);
    });
});

describe('fromFrontmatter', () => {
    it('converts frontmatter to HexerData correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        const frontmatter = toFrontmatter(data);

        // Act
        const newData = fromFrontmatter(frontmatter);

        // Assert
        expect(newData.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });
});

describe('clone', () => {
    it('clones HexerData correctly', () => {
        // Arrange
        const data = new HexerData(emptyState());
        data.setHex({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        const river = new Path("River 1");
        river.addNode({ q: 0, r: 0 });
        river.addNode({ q: 1, r: 2 });
        river.addEdge({ q: 0, r: 0 }, { q: 1, r: 2 });
        data.rivers.push(river);

        const road = new Path("Road 1");
        road.addNode({ q: 1, r: 2 });
        road.addNode({ q: 2, r: 3 });
        road.addEdge({ q: 1, r: 2 }, { q: 2, r: 3 });
        data.roads.push(road);

        // Act
        const clone = data.clone();

        // Assert
        expect(clone).not.toBe(data);
        expect(clone.getHex(0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        expect(clone.rivers).toHaveLength(1);
        expect(clone.rivers[0]).toEqual(river);
        expect(clone.roads).toHaveLength(1);
        expect(clone.roads[0]).toEqual(road);
    });
});