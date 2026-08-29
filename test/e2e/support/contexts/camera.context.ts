import { Camera } from "../../../../src/logic/camera";
import { AxialCoordinates, Point } from "../../../../src/logic/hexagon";

// The World shared by the camera feature steps.
export interface CameraContext {
    // The camera captured before a pan/zoom gesture, to compare against afterwards.
    cameraBeforeGesture?: Camera;
    // A hex placed by a Given step and the screen point it was drawn at, so a
    // later step can assert it stayed put (or moved) under the pointer.
    referenceHex?: AxialCoordinates;
    referenceScreenPoint?: Point;
}
