import { EditorPathState, EditorState, Layer, PaintTool } from "../EditorState";
import { AxialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import {
    Path,
    PathEdge,
    PathNode,
    addEdge,
    addNode,
    getCrossingEdgesAtCoordinates,
    getNode,
    moveNode,
    pathNodeEquals,
    removeEdge,
    removeNode,
} from "../path";
import { RegisteredEvents, ToolStrategy } from "./ToolStrategy";

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
        if(getNode(targetPath, axialCoordinates)) {
            editorState.activePath.activeNode = axialCoordinates;
            return;
        }

        // Break up any crossing paths to connect to the new node
        const crossingPaths = getCrossingEdgesAtCoordinates(targetPath, axialCoordinates);
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
        addEdge(targetPath, this.previousNode, editorState.activePath.activeNode);
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
        if(moveNode(activePath, activeNode, axialCoordinates)) {
            editorState.activePath.activeNode = axialCoordinates;
        }
    }

    public onRightClick(data: HexerData, editorState: EditorState, axialCoordinates: AxialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        const activePath = this.getActivePath(editorState, data);
        const node = getNode(activePath, axialCoordinates);
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

        removeNode(activePath, node);
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
            const fromNode = getNode(targetPath, crossing.edge.from);
            const toNode = getNode(targetPath, crossing.edge.to);
            if (!fromNode || !toNode) {
                return;
            }

            removeEdge(targetPath, fromNode, toNode);
            addEdge(targetPath, fromNode, axialCoordinates);
            addEdge(targetPath, axialCoordinates, toNode);
        });
    }

    private handleNewNode(targetPath: Path, axialCoordinates: AxialCoordinates, activePath: EditorPathState) {
        addNode(targetPath, axialCoordinates);
        if (activePath.activeNode) {
            addEdge(targetPath, activePath.activeNode, axialCoordinates);
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
