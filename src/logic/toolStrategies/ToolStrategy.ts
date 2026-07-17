import { HexData, HexMap } from "../HexerData";

export type RegisteredEvents = {
    'click'?: (hexMap: HexMap, clickedHex: HexData) => void;
}

export interface ToolStrategy {
    getEvents: () => RegisteredEvents;
}