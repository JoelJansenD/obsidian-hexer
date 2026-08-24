import { EditorPathState, EditorState, Layer, PaintTool } from "../EditorState";
import { AxialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import { Path, PathEdge, PathNode, pathNodeEquals } from "../path";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

/**
 * Draws river/road paths node by node. The in-progress path lives in the live
 * editor state (`editorState.activePath`): the active and previous nodes are
 * mutated in place across events and rely on `getEditorState` returning that same
 * object, so this strategy never calls `setEditorState` — the active layer/tool
 * has not changed, and the canvas re-renders after each interaction on its own.
 */
export default class PathPolygonStrategy implements ToolStrategy {

    private previousNode : PathNode | null = null;

    public readonly tool: PaintTool = 'polygon';
    public readonly layers: readonly Layer[] = ['river', 'road'];

    public onLeftClick(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        // If the clicked hex is not the same as the active node, store the active node as the previous node.
        if(editorState.activePath.activeNode?.q !== axialCoordinates.q || editorState.activePath.activeNode.r !== axialCoordinates.r) {
            this.previousNode = editorState.activePath.activeNode;
        }

        const targetPath = this.getActivePath(editorState, data);
        if(targetPath.getNode(axialCoordinates)) {
            editorState.activePath.activeNode = axialCoordinates;
            return;
        }

        // Break up any crossing paths to connect to the new node
        const crossingPaths = targetPath.getCrossingEdgesAtCoordinates(axialCoordinates);
        if(crossingPaths.length > 0) {
            this.handleCrossingPaths(crossingPaths, targetPath, axialCoordinates);
        }
        else {
            this.handleNewNode(targetPath, axialCoordinates, editorState.activePath);
        }

        editorState.activePath.activeNode = axialCoordinates;
    }

    public onLeftDoubleClick(data: HexerData, editorState: EditorState, _: AxialCoordinates) {
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        if(!this.previousNode || this.previousNode === editorState.activePath.activeNode) {
            return;
        }

        const targetPath = this.getActivePath(editorState, data);
        targetPath.addEdge(this.previousNode, editorState.activePath.activeNode);        
    }

    public onLeftDrag(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        const activePath = this.getActivePath(editorState, data);
        const activeNode = editorState.activePath.activeNode;

        if(pathNodeEquals(activeNode, axialCoordinates)) {
            return;
        }

        // If moving is successful, update the active node to the new coordinates so
        // that the node can be moved again in the next drag event.
        if(activePath.moveNode(activeNode, axialCoordinates)) {
            editorState.activePath.activeNode = axialCoordinates;
        }
    }

    public onRightClick(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        const activePath = this.getActivePath(editorState, data);
        const node = activePath.getNode(axialCoordinates);
        if (!node) {
            return;
        }

        // To prevent resurrecting the deleted node, active and previous nodes must be cleared if they are the same as the deleted node.
        if(pathNodeEquals(node, editorState.activePath.activeNode)) {
            editorState.activePath.activeNode = null;
        }

        if(pathNodeEquals(node, this.previousNode)) {
            this.previousNode = null;
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

    private handleCrossingPaths(crossingPaths: { edge: PathEdge; nodes: PathNode[]; }[], targetPath: Path, axialCoordinates: AxialCoordinates) {
        crossingPaths.forEach(crossing => {
            const fromNode = targetPath.getNode(crossing.edge.from);
            const toNode = targetPath.getNode(crossing.edge.to);
            if (!fromNode || !toNode) {
                return;
            }

            targetPath.removeEdge(fromNode, toNode);
            targetPath.addEdge(fromNode, axialCoordinates);
            targetPath.addEdge(axialCoordinates, toNode);
        });
    }

    private handleNewNode(targetPath: Path, axialCoordinates: AxialCoordinates, activePath: EditorPathState) {
        targetPath.addNode(axialCoordinates);
        if (activePath.activeNode) {
            targetPath.addEdge(activePath.activeNode, axialCoordinates);
        }
    }

    public getEvents(): RegisteredEvents {
        return {
            onLeftClick: this.onLeftClick.bind(this),
            onLeftDoubleClick: this.onLeftDoubleClick.bind(this),
            onLeftDrag: this.onLeftDrag.bind(this),
            onRightClick: this.onRightClick.bind(this),
        };
    }

}
