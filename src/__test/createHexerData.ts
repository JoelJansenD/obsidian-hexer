import { Path } from "../logic/path";
import { CURRENT_VERSION, HexerData, HexMap } from "../logic/HexerData";

interface HexerDataOverrides {
    hexes?: HexMap;
    rivers?: Path[];
    roads?: Path[];
    size?: number;
}

export default function createHexerData(overrides: HexerDataOverrides = {}): HexerData {
    return new HexerData({
        version: CURRENT_VERSION,
        hexes: overrides.hexes ?? new Map(),
        rivers: overrides.rivers ?? [],
        roads: overrides.roads ?? [],
        size: overrides.size ?? 50
    });
}
