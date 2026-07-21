import { RadialCoordinates } from "../../../src/logic/hexagon";
import { Icon } from "../../../src/logic/icon";

export interface TestContext {
    icon?: Icon;
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
}