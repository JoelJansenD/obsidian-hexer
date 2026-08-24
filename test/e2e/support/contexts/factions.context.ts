import { Faction } from "../../../../src/logic/faction";
import { AxialCoordinates } from "../../../../src/logic/hexagon";

export interface FactionsContext {
    selectedFaction?: Faction;
    originalFaction?: Faction;
    expectedName?: string;
    attachedNotePath?: string;
    lastClickedHex?: AxialCoordinates;
    lastDraggedHexes?: AxialCoordinates[];
    regionHexes?: AxialCoordinates[];
}
