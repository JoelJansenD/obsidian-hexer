export const RAINBOW_LENGTH = 7;

export interface RainbowHexState {
    readonly colorIndex: number;
}

export function createHexState(): RainbowHexState {
    return { colorIndex: 0 };
}

export function cycle(state: RainbowHexState): RainbowHexState {
    return { colorIndex: (state.colorIndex + 1) % RAINBOW_LENGTH };
}
