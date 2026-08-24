import { HexerData } from "../logic/HexerData";
import { EditorState } from "../logic/EditorState"
import { ComponentOptions } from "../view/editor/Editor"
import createHexerData from "./createHexerData";

const defaultEditorState: EditorState = {
    activeColor: '#000000',
    activeIcon: {
        color: '#000000',
        name: 'castle'
    },
    activeLayer: 'terrain',
    activePaintTool: 'brush',
    activePath: null,
    activeFactionId: null
};
export default defaultEditorState;

const cloneEditorState = (state: EditorState): EditorState => ({
    ...state,
    activeIcon: { ...state.activeIcon },
    activePath: state.activePath === null ? null : {
        ...state.activePath,
        activeNode: state.activePath.activeNode === null ? null : { ...state.activePath.activeNode },
    },
});

export const createComponentOptions = (overrides: Partial<EditorState> = {}, initialData?: HexerData): ComponentOptions => {
    let state: EditorState = cloneEditorState({
        ...defaultEditorState,
        ...overrides,
    });
    let data = initialData ?? createHexerData();
    return {
        getDataClone: () => data.clone(),
        setData: vi.fn(next => data = next),
        getEditorState: () => state,
        setEditorState: vi.fn((next: EditorState) => { state = cloneEditorState(next); }),
        obsidian: {} as ComponentOptions['obsidian'],
    };
};