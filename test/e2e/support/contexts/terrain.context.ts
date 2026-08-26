import { AxialCoordinates } from "../../../../src/logic/hexagon";

export interface TerrainContext {
    lastClickedHex?: AxialCoordinates;
    lastDraggedHexes?: AxialCoordinates[];
}
