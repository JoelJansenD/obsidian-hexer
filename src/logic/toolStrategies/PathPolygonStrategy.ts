import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData, HexMap } from "../HexerData";
import { Path } from "../path";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class PathPolygonStrategy implements ToolStrategy {
    public canBeApplied (layer: Layer, tool: PaintTool) {
        return (layer === 'river' || layer === 'road') && tool === 'polygon';
    }

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        const allPaths = [...data.rivers, ...data.roads];
        const targetPath = this.getPath(editorState.activePath.id, allPaths);
        if(!targetPath) {
            throw new Error(`Active path '${editorState.activePath.name}' with id ${editorState.activePath.id} not found in data.`);
        }

        targetPath.addNode(radialCoordinates);
    }

    private getPath(id: string, paths: Path[]): Path | null {
        return paths.find(path => path.id === id) || null;
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
        };
    }

}
