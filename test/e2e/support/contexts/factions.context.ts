import { Faction } from "../../../../src/logic/faction";
import { RadialCoordinates } from "../../../../src/logic/hexagon";

export interface FactionsContext {
    selectedFaction?: Faction;
    originalFaction?: Faction;
    expectedName?: string;
    attachedNotePath?: string;
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
}
