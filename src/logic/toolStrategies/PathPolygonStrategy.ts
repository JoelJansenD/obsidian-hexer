import { EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData, HexMap } from "../HexerData";
import { Path, PathNode } from "../path";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

export default class PathPolygonStrategy implements ToolStrategy {

    private previousNode : PathNode | null = null;

    public canBeApplied (layer: Layer, tool: PaintTool) {
        return (layer === 'river' || layer === 'road') && tool === 'polygon';
    }

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        // If the clicked hex is not the same as the active node, store the active node as the previous node.
        if(editorState.activePath.activeNode?.q !== radialCoordinates.q || editorState.activePath.activeNode.r !== radialCoordinates.r) {
            this.previousNode = editorState.activePath.activeNode;
        }

        const targetPath = this.getActivePath(editorState, data);
        if(targetPath.getNode(radialCoordinates)) {
            editorState.activePath.activeNode = radialCoordinates;
            return;
        }

        targetPath.addNode(radialCoordinates);
        if(editorState.activePath.activeNode) {
            targetPath.addEdge(editorState.activePath.activeNode, radialCoordinates);
        }

        editorState.activePath.activeNode = radialCoordinates;
    }

    public onLeftDoubleClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        console.log('onLeftDoubleClick', this.previousNode, editorState.activePath?.activeNode );
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        if(!this.previousNode || this.previousNode === editorState.activePath.activeNode) {
            return;
        }

        const targetPath = this.getActivePath(editorState, data);
        targetPath.addEdge(this.previousNode, editorState.activePath.activeNode);        
    }

    private getActivePath(editorState: EditorState, data: HexerData): Path {
        if(!editorState.activePath) {
            throw new Error('No active path in editor state.');
        }

        const allPaths = [...data.rivers, ...data.roads];
        const targetPath = this.getPath(editorState.activePath.path.id, allPaths);
        if(!targetPath) {
            throw new Error(`Active path '${editorState.activePath.path.name}' with id ${editorState.activePath.path.id} not found in data.`);
        }

        return targetPath;
    }

    private getPath(id: string, paths: Path[]): Path | null {
        return paths.find(path => path.id === id) || null;
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDoubleClick: this.onLeftDoubleClick.bind(this),
        };
    }

}
