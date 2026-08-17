import { Path } from "../logic/path";
import { CURRENT_VERSION, HexerData, HexMap } from "../logic/HexerData";
import { Faction } from "../logic/faction";

interface HexerDataOverrides {
    hexes?: HexMap;
    rivers?: Path[];
    roads?: Path[];
    factions?: Faction[];
    size?: number;
}

export default function createHexerData(overrides: HexerDataOverrides = {}): HexerData {
    return new HexerData({
        version: CURRENT_VERSION,
        hexes: overrides.hexes ?? new Map(),
        rivers: overrides.rivers ?? [],
        roads: overrides.roads ?? [],
        factions: overrides.factions ?? [],
        size: overrides.size ?? 50
    });
}
