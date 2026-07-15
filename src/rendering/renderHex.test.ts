import { describe, it, expect } from 'vitest';
import { createHexState, cycle } from '../logic/RainbowHex';
import { RAINBOW_COLORS } from './colors';
import { renderHex } from './renderHex';

const viewport = { width: 400, height: 400 };

describe('renderHex', () => {
    it('returns exactly one draw command', () => {
        expect(renderHex(createHexState(), viewport)).toHaveLength(1);
    });

    it('command is a fill-polygon', () => {
        const [cmd] = renderHex(createHexState(), viewport);
        expect(cmd.type).toBe('fill-polygon');
    });

    it('polygon has 6 corners', () => {
        const [cmd] = renderHex(createHexState(), viewport);
        expect(cmd.points).toHaveLength(6);
    });

    it('each corner is a [number, number] pair', () => {
        const [cmd] = renderHex(createHexState(), viewport);
        for (const pt of cmd.points) {
            expect(pt).toHaveLength(2);
            expect(typeof pt[0]).toBe('number');
            expect(typeof pt[1]).toBe('number');
        }
    });

    it('uses the colour matching the current colorIndex', () => {
        let state = createHexState();
        for (let i = 0; i < RAINBOW_COLORS.length; i++) {
            const [cmd] = renderHex(state, viewport);
            expect(cmd.color).toBe(RAINBOW_COLORS[i]);
            state = cycle(state);
        }
    });

    it('wraps back to the first colour after a full cycle', () => {
        let state = createHexState();
        for (let i = 0; i < RAINBOW_COLORS.length; i++) state = cycle(state);
        const [cmd] = renderHex(state, viewport);
        expect(cmd.color).toBe(RAINBOW_COLORS[0]);
    });
});
