import type { RainbowHexState } from '../../logic/RainbowHex';
import type { DrawCommand } from './DrawCommand';
import type { Viewport } from './Viewport';
import { RAINBOW_COLORS } from './colors';
import { hexCorners } from './geometry';

export function renderHex(state: RainbowHexState, viewport: Viewport): DrawCommand[] {
    const cx = viewport.width / 2;
    const cy = viewport.height / 2;
    const radius = Math.min(viewport.width, viewport.height) * 0.4;
    return [
        {
            type: 'fill-polygon',
            points: hexCorners(cx, cy, radius),
            color: RAINBOW_COLORS[state.colorIndex],
        },
    ];
}
