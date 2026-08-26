import { EditorPathState, EditorState, Layer, PaintTool } from "../EditorState";
import { RadialCoordinates } from "../hexagon";
import { HexerData } from "../HexerData";
import {
    PathData,
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

    public onLeftClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        // If the clicked hex is not the same as the active node, store the active node as the previous node.
        if(editorState.activePath.activeNode?.q !== radialCoordinates.q || editorState.activePath.activeNode.r !== radialCoordinates.r) {
            this.previousNode = editorState.activePath.activeNode;
        }

        const targetPath = this.getActivePath(editorState, data);
        if(getNode(targetPath, radialCoordinates)) {
            editorState.activePath.activeNode = radialCoordinates;
            return;
        }

        // Break up any crossing paths to connect to the new node
        const crossingPaths = getCrossingEdgesAtCoordinates(targetPath, radialCoordinates);
        if(crossingPaths.length > 0) {
            this.handleCrossingPaths(crossingPaths, targetPath, radialCoordinates);
        }
        else {
            this.handleNewNode(targetPath, radialCoordinates, editorState.activePath);
        }

        editorState.activePath.activeNode = radialCoordinates;
    }

    public onLeftDoubleClick(data: HexerData, editorState: EditorState, _: RadialCoordinates) {
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        if(!this.previousNode || this.previousNode === editorState.activePath.activeNode) {
            return;
        }

        const targetPath = this.getActivePath(editorState, data);
        addEdge(targetPath, this.previousNode, editorState.activePath.activeNode);
    }

    public onLeftDrag(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath || !editorState.activePath.activeNode) {
            return;
        }

        const activePath = this.getActivePath(editorState, data);
        const activeNode = editorState.activePath.activeNode;

        if(pathNodeEquals(activeNode, radialCoordinates)) {
            return;
        }

        // If moving is successful, update the active node to the new coordinates so
        // that the node can be moved again in the next drag event.
        if(moveNode(activePath, activeNode, radialCoordinates)) {
            editorState.activePath.activeNode = radialCoordinates;
        }
    }

    public onRightClick(data: HexerData, editorState: EditorState, radialCoordinates: RadialCoordinates) {
        if(!editorState.activePath) {
            return;
        }

        const activePath = this.getActivePath(editorState, data);
        const node = getNode(activePath, radialCoordinates);
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

    private getActivePath(editorState: EditorState, data: HexerData): PathData {
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

    private getPath(id: string, paths: PathData[]): PathData | null {
        return paths.find(path => path.id === id) || null;
    }

    private handleCrossingPaths(crossingPaths: { edge: PathEdge; nodes: PathNode[]; }[], targetPath: PathData, radialCoordinates: RadialCoordinates) {
        crossingPaths.forEach(crossing => {
            const fromNode = getNode(targetPath, crossing.edge.from);
            const toNode = getNode(targetPath, crossing.edge.to);
            if (!fromNode || !toNode) {
                return;
            }

            removeEdge(targetPath, fromNode, toNode);
            addEdge(targetPath, fromNode, radialCoordinates);
            addEdge(targetPath, radialCoordinates, toNode);
        });
    }

    private handleNewNode(targetPath: PathData, radialCoordinates: RadialCoordinates, activePath: EditorPathState) {
        addNode(targetPath, radialCoordinates);
        if (activePath.activeNode) {
            addEdge(targetPath, activePath.activeNode, radialCoordinates);
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
