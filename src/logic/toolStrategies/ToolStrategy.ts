import { EditorState } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";

export type ToolEventHandler = (hexMap: HexMap, editorState: EditorState, coordinates: RadialCoordinates) => void;

export type RegisteredEvents = {
    onLeftClick?: ToolEventHandler;
    onLeftDrag?: ToolEventHandler;
}

export interface ToolStrategy {
    getEvents: () => RegisteredEvents;
}