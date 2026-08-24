import { AxialCoordinates } from "../../../../src/logic/hexagon";
import { Path } from "../../../../src/logic/path";

export interface RiversAndRoadsContext {
    lastClickedHex?: AxialCoordinates;
    previouslyClickedHex?: AxialCoordinates;
    selectedRiver?: Path;
    // The name typed into the settings dialog, checked once the path is saved.
    expectedName?: string;
    // Vault path of the note attached via the settings dialog.
    attachedNotePath?: string;
    draggedFromHex?: AxialCoordinates;
    draggedToHex?: AxialCoordinates;
    // The dragged node's neighbours, captured before the drag so its edges can be
    // checked for having followed the node to its new hex.
    nodesConnectedToDragged?: AxialCoordinates[];
}
