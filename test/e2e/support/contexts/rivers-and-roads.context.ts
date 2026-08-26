import { RadialCoordinates } from "../../../../src/logic/hexagon";
import { PathData } from "../../../../src/logic/path";

export interface RiversAndRoadsContext {
    lastClickedHex?: RadialCoordinates;
    previouslyClickedHex?: RadialCoordinates;
    selectedRiver?: PathData;
    // The name typed into the settings dialog, checked once the path is saved.
    expectedName?: string;
    // Vault path of the note attached via the settings dialog.
    attachedNotePath?: string;
    draggedFromHex?: RadialCoordinates;
    draggedToHex?: RadialCoordinates;
    // The dragged node's neighbours, captured before the drag so its edges can be
    // checked for having followed the node to its new hex.
    nodesConnectedToDragged?: RadialCoordinates[];
}
