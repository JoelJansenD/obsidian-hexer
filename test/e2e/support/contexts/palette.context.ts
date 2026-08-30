import { GlobalContext } from "./global.context";

// Extends the shared World with the colour captured when a palette swatch is
// selected, so a later step can assert the painted terrain matches it.
export interface PaletteContext extends GlobalContext {
    selectedSwatchColour?: string;
}
