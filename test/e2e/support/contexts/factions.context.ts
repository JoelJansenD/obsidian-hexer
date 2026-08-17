import { Faction } from "../../../../src/logic/faction";

export interface FactionsContext {
    selectedFaction?: Faction;
    expectedName?: string;
    attachedNotePath?: string;
}
