import { EditorState } from "../logic/EditorState"

const defaultEditorState: EditorState = {
    activeColour: '#000000',
    activeIcon: {
        color: '#000000',
        name: 'castle'
    },
    activeLayer: 'terrain',
    activePaintTool: 'brush',
    activePath: null
};
export default defaultEditorState;