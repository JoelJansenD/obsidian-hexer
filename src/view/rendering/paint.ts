import type { DrawCommand } from './DrawCommand';

export function paint(ctx: CanvasRenderingContext2D, cmds: DrawCommand[]): void {
    for (const cmd of cmds) {
        if (cmd.type === 'fill-polygon') {
            ctx.fillStyle = cmd.color;
            ctx.beginPath();
            for (let i = 0; i < cmd.points.length; i++) {
                const [x, y] = cmd.points[i];
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}
