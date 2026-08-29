// The World shared by the coordinate-label feature steps.
export interface CoordinatesContext {
    // The q,r text of every label captured on the canvas by the most recent
    // "rendered"/zoom step, so a later Then can assert what was (or wasn't) drawn.
    drawnLabels?: string[];
}
