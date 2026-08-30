import { defaultCamera } from "../logic/camera";
import { Faction } from "../logic/faction";
import { DEFAULT_ICON_PALETTE, DEFAULT_TERRAIN_PALETTE, getHex, initialFileContent, setHex } from "../logic/HexerData";
import { defaultMapSettings } from "../logic/mapSettings";
import { addEdge, addNode, createPath } from "../logic/path";
import createHexerData from "../__test/createHexerData";
import { fromFrontmatter, parseHexerDocument, serializeHexerDocument, toFrontmatter } from "./frontmatter";

describe('toFrontmatter', () => {
    it('nests the map under the hexer key unchanged', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });

        // Act
        const frontmatter = toFrontmatter(data);

        // Assert
        expect(frontmatter.hexer).toEqual({
            version: '1.0',
            size: 50,
            mapSettings: defaultMapSettings(),
            camera: defaultCamera(),
            hexes: { '0,0': { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null } },
            rivers: [],
            roads: [],
            factions: [],
            terrainPalette: DEFAULT_TERRAIN_PALETTE,
            iconPalette: DEFAULT_ICON_PALETTE,
        });
    });
});

describe('frontmatter round-trip', () => {
    it('survives structured serialization to a plain object and back', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        setHex(data, { q: 1, r: 2, terrainColor: '#00ff00', icon: null, factionId: null });

        const river = createPath("River 1");
        addNode(river, { q: 0, r: 0 });
        addNode(river, { q: 1, r: 2 });
        addEdge(river, { q: 0, r: 0 }, { q: 1, r: 2 });
        data.rivers.push(river);

        const road = createPath("Road 1");
        addNode(road, { q: 1, r: 2 });
        addNode(road, { q: 2, r: 3 });
        addEdge(road, { q: 1, r: 2 }, { q: 2, r: 3 });
        data.roads.push(road);

        const faction: Faction = { id: 'faction-1', name: 'Faction 1', color: '#0000ff', filePath: 'Factions/Faction 1.md' };
        data.factions.push(faction);

        // Act - mimic the on-disk write/read cycle. Every field is a plain object
        // or array, so a JSON round-trip reproduces the map exactly.
        const serialized = JSON.parse(JSON.stringify(toFrontmatter(data)));
        const restored = fromFrontmatter(serialized);

        // Assert
        expect(getHex(restored, 0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        expect(getHex(restored, 1, 2)).toEqual({ q: 1, r: 2, terrainColor: '#00ff00', icon: null, factionId: null });
        expect(restored.size).toBe(50);
        expect(restored.version).toBe('1.0');
        expect(restored.rivers.length).toBe(1);
        expect(restored.rivers[0]).toEqual(river);
        expect(restored.roads.length).toBe(1);
        expect(restored.roads[0]).toEqual(road);
        expect(restored.factions.length).toBe(1);
        expect(restored.factions[0]).toEqual(faction);
    });
});

describe('fromFrontmatter', () => {
    it('reads the map back out of the hexer key', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        const frontmatter = toFrontmatter(data);

        // Act
        const newData = fromFrontmatter(frontmatter);

        // Assert
        expect(getHex(newData, 0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
    });
});

describe('document seam', () => {
    it('serializeHexerDocument preserves the markdown body after the frontmatter block', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        const existing = '---\nhexer:\n  version: "1.0"\n---\n\nSome map notes.\n';

        // Act
        const serialized = serializeHexerDocument(data, existing);

        // Assert
        expect(serialized.endsWith('\n\nSome map notes.\n')).toBe(true);
        expect(serialized.startsWith('---\n')).toBe(true);
    });

    it('round-trips a document string through parse and serialize', () => {
        // Arrange
        const data = createHexerData();
        setHex(data, { q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        const river = createPath('River 1');
        addEdge(river, { q: 0, r: 0 }, { q: 1, r: 2 });
        data.rivers.push(river);

        // Act - write to a document string, then read it back.
        const document = serializeHexerDocument(data, '---\nhexer:\n  version: "1.0"\n---\n\nBody kept intact.\n');
        const restored = parseHexerDocument(document);

        // Assert
        expect(getHex(restored, 0, 0)).toEqual({ q: 0, r: 0, terrainColor: '#ff0000', icon: null, factionId: null });
        expect(restored.rivers).toEqual([river]);
        // A second write leaves the body untouched.
        expect(serializeHexerDocument(restored, document)).toBe(document);
    });

    it('throws when the document has no frontmatter block', () => {
        expect(() => parseHexerDocument('no frontmatter here')).toThrow('Missing frontmatter');
    });
});

describe('palette serialization', () => {
    it('parses the initial file template with both palettes seeded', () => {
        // Act - the template must be valid YAML carrying the default palettes.
        const restored = parseHexerDocument(initialFileContent);

        // Assert
        expect(restored.terrainPalette).toEqual(DEFAULT_TERRAIN_PALETTE);
        expect(restored.iconPalette).toEqual(DEFAULT_ICON_PALETTE);
    });

    it('round-trips a stored palette through serialize and parse', () => {
        // Arrange
        const stored = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999', '#aaaaaa'];
        const data = createHexerData({ terrainPalette: stored });
        const document = serializeHexerDocument(data, '---\nhexer:\n  version: "1.0"\n---\n');

        // Act
        const restored = parseHexerDocument(document);

        // Assert
        expect(restored.terrainPalette).toEqual(stored);
    });
});

describe('camera serialization', () => {
    it('round-trips a non-default zoom through serialize and parse', () => {
        // Arrange
        const data = createHexerData({ camera: { offset: { x: 5, y: 6 }, zoom: 2.5 } });

        // Act
        const document = serializeHexerDocument(data, '---\nhexer:\n  version: "1.0"\n---\n');
        const restored = parseHexerDocument(document);

        // Assert
        expect(restored.camera).toEqual({ offset: { x: 5, y: 6 }, zoom: 2.5 });
    });
});
