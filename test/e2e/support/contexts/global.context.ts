import { AxialCoordinates } from "../../../../src/logic/hexagon";

// The World shared by the steps in global.steps.ts, which any feature can use.
export interface GlobalContext {
    lastClickedHex?: AxialCoordinates;
    lastDraggedHexes?: AxialCoordinates[];
}
