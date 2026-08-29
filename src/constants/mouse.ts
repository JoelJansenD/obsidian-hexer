// Mouse button constants shared across the editor, so the same magic numbers
// aren't redefined per component.

/**
 * `MouseEvent.button` — which single button triggered the event.
 */
export const LEFT_MOUSE_BUTTON = 0;
export const MIDDLE_MOUSE_BUTTON = 1;
export const RIGHT_MOUSE_BUTTON = 2;

/**
 * `MouseEvent.buttons` — bitmask of the buttons currently held. Distinct from
 * {@link LEFT_MOUSE_BUTTON} and friends, which identify a single button.
 */
export const LEFT_MOUSE_BUTTON_HELD = 1;
