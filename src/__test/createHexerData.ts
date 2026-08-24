import { Path } from "../logic/path";
import { CURRENT_VERSION, HexerData, HexMap } from "../logic/HexerData";
import { Faction } from "../logic/faction";
import { defaultMapSettings, MapSettings } from "../logic/mapSettings";
import { Camera, defaultCamera } from "../logic/camera";

interface HexerDataOverrides {
    hexes?: HexMap;
    rivers?: Path[];
    roads?: Path[];
    factions?: Faction[];
    mapSettings?: MapSettings;
    camera?: Camera;
    size?: number;
}

export default function createHexerData(overrides: HexerDataOverrides = {}): HexerData {
    return new HexerData({
        version: CURRENT_VERSION,
        hexes: overrides.hexes ?? new Map(),
        rivers: overrides.rivers ?? [],
        roads: overrides.roads ?? [],
        factions: overrides.factions ?? [],
        mapSettings: overrides.mapSettings ?? defaultMapSettings(),
        camera: overrides.camera ?? defaultCamera(),
        size: overrides.size ?? 50
    });
}
