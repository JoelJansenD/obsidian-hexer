import { EditorState } from "../logic/EditorState"
import { ComponentOptions } from "../view/editor/Editor"
import createHexerData from "./createHexerData";

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

export const createComponentOptions = (overrides: Partial<EditorState> = {}): ComponentOptions => {
    let state: EditorState = {
        ...defaultEditorState,
        ...overrides,
    };
    let data = createHexerData();
    return {
        getDataClone: () => data,
        setData: vi.fn(next => data = next),
        getEditorState: () => state,
        setEditorState: vi.fn((next: EditorState) => { state = next; }),
        obsidian: {} as ComponentOptions['obsidian'],
    };
};