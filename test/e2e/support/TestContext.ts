import { RadialCoordinates } from "../../../src/logic/hexagon";
import { Icon } from "../../../src/logic/icon";
import { PathSummary } from "./path.page";

export interface TestContext {
    icon?: Icon;
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
    selectedRiver?: PathSummary;
}