import { Hexagon, radialCoordinatesToPoint } from "../logic/hexagon";
import { HexerData } from "../logic/HexerData";

export default function render(context: CanvasRenderingContext2D, data: HexerData) {
    // Clear the full backing store regardless of the current DPR transform.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();

    for(const hex of data.hexes.values()) {
        drawHex(context, hex, data.size);
    }
}

function drawHex(context: CanvasRenderingContext2D, hex: Hexagon, size: number) {
    const hexCenter = radialCoordinatesToPoint(hex, size);

    context.beginPath();
    for(let cornerIdx = 0; cornerIdx < 6; cornerIdx++) {
        const degree = 60 * cornerIdx;
        const angle = (Math.PI / 180) * degree;

        const cornerX = hexCenter.x + size * Math.cos(angle);
        const cornerY = hexCenter.y + size * Math.sin(angle);

        if(cornerIdx === 0) {
            context.moveTo(cornerX, cornerY);
        } else {
            context.lineTo(cornerX, cornerY);
        }
    }
    context.closePath();

    if(hex.terrainColor) {
        context.fillStyle = hex.terrainColor;
        context.fill();
    }

    context.stroke();
}