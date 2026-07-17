import { Hexagon } from "../hexagon";
import { HexMap } from "../HexerData";
import { ToolStrategy } from "./ToolStrategy";

export default class TerrainPaintStrategy implements ToolStrategy {

    public onClick(hexMap: HexMap, clickedHex: Hexagon) {
        console.log(`TerrainPaintStrategy: onClick event triggered for hex at q=${clickedHex.q}, r=${clickedHex.r}`);
    }

    public getEvents() {
        return {
            click: this.onClick
        };
    }

}