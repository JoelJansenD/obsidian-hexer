import { RadialCoordinates, radialCoordinatesToPoint } from "../logic/hexagon";
import { HexerData } from "../logic/HexerData";

export default function render(context: CanvasRenderingContext2D, data: HexerData) {
    for(const hex of data.hexes.values()) {
        drawHex(context, hex, data.size);
    }
}

function drawHex(context: CanvasRenderingContext2D, coordinate: RadialCoordinates, size: number) {
    const hexCenter = radialCoordinatesToPoint(coordinate, size);
    console.log(`Drawing hex at center: (${hexCenter.x}, ${hexCenter.y})`);
}