import { EditorState } from "../EditorState";
import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";

export type RegisteredEvents = {
    'click'?: (hexMap: HexMap, editorState: EditorState, clickedCoordinates: RadialCoordinates) => void;
}

export interface ToolStrategy {
    getEvents: () => RegisteredEvents;
}