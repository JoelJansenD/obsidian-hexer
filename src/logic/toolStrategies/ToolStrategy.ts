import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";

export type RegisteredEvents = {
    'click'?: (hexMap: HexMap, clickedCoordinates: RadialCoordinates) => void;
}

export interface ToolStrategy {
    getEvents: () => RegisteredEvents;
}