import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";

export type RegisteredEvents = {
    'click'?: (hexMap: HexMap, clickedHex: Hexagon) => void;
}

export interface ToolStrategy {
    getEvents: () => RegisteredEvents;
}