import { RadialCoordinates } from "../../../src/logic/hexagon";

export interface TestContext {
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
}