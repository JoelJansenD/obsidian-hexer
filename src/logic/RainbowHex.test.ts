import { describe, it, expect } from 'vitest';
import { RAINBOW_LENGTH, createHexState, cycle } from './RainbowHex';

describe('createHexState', () => {
    it('starts at colorIndex 0', () => {
        expect(createHexState().colorIndex).toBe(0);
    });
});

describe('cycle', () => {
    it('advances colorIndex by 1', () => {
        const s0 = createHexState();
        expect(cycle(s0).colorIndex).toBe(1);
    });

    it('advances through each index in sequence', () => {
        let state = createHexState();
        for (let i = 0; i < RAINBOW_LENGTH; i++) {
            expect(state.colorIndex).toBe(i);
            state = cycle(state);
        }
    });

    it('wraps from index 6 back to 0', () => {
        let state = createHexState();
        for (let i = 0; i < RAINBOW_LENGTH - 1; i++) {
            state = cycle(state);
        }
        expect(state.colorIndex).toBe(RAINBOW_LENGTH - 1);
        expect(cycle(state).colorIndex).toBe(0);
    });

    it('returns a new state object (immutability)', () => {
        const s0 = createHexState();
        const s1 = cycle(s0);
        expect(s1).not.toBe(s0);
        expect(s0.colorIndex).toBe(0);
    });
});
