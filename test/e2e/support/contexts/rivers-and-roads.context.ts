import { RadialCoordinates } from "../../../../src/logic/hexagon";
import { Path } from "../../../../src/logic/path";

export interface RiversAndRoadsContext {
    lastClickedHex?: RadialCoordinates;
    previouslyClickedHex?: RadialCoordinates;
    selectedRiver?: Path;
}
