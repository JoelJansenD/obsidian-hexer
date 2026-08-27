import { AxialCoordinates } from "../../../../src/logic/hexagon";
import { Icon } from "../../../../src/logic/icon";

export interface IconContext {
    icon?: Icon;
    lastClickedHex?: AxialCoordinates;
    lastDraggedHexes?: AxialCoordinates[];
}
