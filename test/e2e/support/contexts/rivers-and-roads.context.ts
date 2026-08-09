import { RadialCoordinates } from "../../../../src/logic/hexagon";
import { Path } from "../../../../src/logic/path";

export interface RiversAndRoadsContext {
    lastClickedHex?: RadialCoordinates;
    previouslyClickedHex?: RadialCoordinates;
    selectedRiver?: Path;
    draggedFromHex?: RadialCoordinates;
    draggedToHex?: RadialCoordinates;
    // The dragged node's neighbours, captured before the drag so its edges can be
    // checked for having followed the node to its new hex.
    nodesConnectedToDragged?: RadialCoordinates[];
}
