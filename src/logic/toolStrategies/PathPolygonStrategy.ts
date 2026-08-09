import { EditorPathState, EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { Path, PathEdge, PathNode } from "../path";
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

        // Break up any crossing paths to connect to the new node
        const crossingPaths = targetPath.getCrossingEdgesAtCoordinates(radialCoordinates);
        if(crossingPaths.length > 0) {
            this.handleCrossingPaths(crossingPaths, targetPath, radialCoordinates);
        }
        else {
            this.handleNewNode(targetPath, radialCoordinates, editorState.activePath);
        }

        editorState.activePath.activeNode = radialCoordinates;
    }

    public onLeftDoubleClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        if(!this.previousNode || this.previousNode === editorState.activePath.activeNode) {
            return;
        }

        const targetPath = this.getActivePath(editorState, data);
        targetPath.addEdge(this.previousNode, editorState.activePath.activeNode);        
    }

    public onRightClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath) {
            return;
        }
        
        const activePath = this.getActivePath(editorState, data);
        const node = activePath.getNode(radialCoordinates);
        if (!node) {
            return;
        }

        activePath.removeNode(node);
    }

    private getActivePath(editorState: EditorState, data: HexerData): Path {
        if(!editorState.activePath) {
            throw new Error('No active path in editor state.');
        }

        const allPaths = [...data.rivers, ...data.roads];
        const targetPath = this.getPath(editorState.activePath.pathId, allPaths);
        if(!targetPath) {
            throw new Error(`Active path with id ${editorState.activePath.pathId} not found in data.`);
        }

        return targetPath;
    }

    private getPath(id: string, paths: Path[]): Path | null {
        return paths.find(path => path.id === id) || null;
    }

    private handleCrossingPaths(crossingPaths: { edge: PathEdge; nodes: PathNode[]; }[], targetPath: Path, radialCoordinates: RadialCoordinates) {
        crossingPaths.forEach(crossing => {
            const fromNode = targetPath.getNode(crossing.edge.from);
            const toNode = targetPath.getNode(crossing.edge.to);
            if (!fromNode || !toNode) {
                return;
            }

            targetPath.removeEdge(fromNode, toNode);
            targetPath.addEdge(fromNode, radialCoordinates);
            targetPath.addEdge(radialCoordinates, toNode);
        });
    }

    private handleNewNode(targetPath: Path, radialCoordinates: RadialCoordinates, activePath: EditorPathState) {
        targetPath.addNode(radialCoordinates);
        if (activePath.activeNode) {
            targetPath.addEdge(activePath.activeNode, radialCoordinates);
        }
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDoubleClick: this.onLeftDoubleClick.bind(this),
            onRightClick: this.onRightClick.bind(this),
        };
    }

}
