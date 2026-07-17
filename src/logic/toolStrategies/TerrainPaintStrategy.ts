import { Hexagon, RadialCoordinates } from "../hexagon";
import { HexMap } from "../HexerData";
import { ToolStrategy } from "./ToolStrategy";

export default class TerrainPaintStrategy implements ToolStrategy {

    public onClick(hexMap: HexMap, radialCoordinates: RadialCoordinates) {
        console.log(`TerrainPaintStrategy: onClick event triggered for hex at q=${radialCoordinates.q}, r=${radialCoordinates.r}`);
    }

    public getEvents() {
        return {
            click: this.onClick
        };
    }

}