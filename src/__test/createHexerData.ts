import { Path } from "../logic/path";
import { CURRENT_VERSION, HexerData } from "../logic/HexerData";
import { Faction } from "../logic/faction";
import { Hexagon } from "../logic/hexagon";
import { defaultMapSettings, MapSettings } from "../logic/mapSettings";
import { Camera, defaultCamera } from "../logic/camera";

interface HexerDataOverrides {
    hexes?: Record<string, Hexagon>;
    rivers?: Path[];
    roads?: Path[];
    factions?: Faction[];
    mapSettings?: MapSettings;
    camera?: Camera;
    size?: number;
}

export default function createHexerData(overrides: HexerDataOverrides = {}): HexerData {
    return {
        version: CURRENT_VERSION,
        hexes: overrides.hexes ?? {},
        rivers: overrides.rivers ?? [],
        roads: overrides.roads ?? [],
        factions: overrides.factions ?? [],
        mapSettings: overrides.mapSettings ?? defaultMapSettings(),
        camera: overrides.camera ?? defaultCamera(),
        size: overrides.size ?? 50
    };
}
