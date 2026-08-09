import { RadialCoordinates } from "../../../../src/logic/hexagon";

export interface TerrainContext {
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
}
