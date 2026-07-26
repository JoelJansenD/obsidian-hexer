import { RadialCoordinates } from "../../../src/logic/hexagon";
import { Icon } from "../../../src/logic/icon";
import { Path } from "../../../src/logic/path";

export interface TestContext {
    icon?: Icon;
    lastClickedHex?: RadialCoordinates;
    lastDraggedHexes?: RadialCoordinates[];
    selectedRiver?: Path;
}