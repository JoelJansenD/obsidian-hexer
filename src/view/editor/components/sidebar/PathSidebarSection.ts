import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";
import SidebarListRow from "./SidebarListRow";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import { Path } from "../../../../logic/path";
import { ItemSettings } from "../../../ObsidianInterop";

interface PathSidebarSectionOptions extends EditorListSidebarSectionOptions {
    /** Selects the paths array (rivers or roads) this section manages. */
    getPaths: (data: HexerData) => Path[];
}

/**
 * A sidebar section that lists the paths of a single layer (rivers or roads),
 * with an "add path" button. Shared by the river and road sections; the generic
 * list scaffolding lives in {@link EditorListSidebarSection}.
 */
export default class PathSidebarSection extends EditorListSidebarSection<Path> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        private _pathOptions: PathSidebarSectionOptions,
    ) {
        super(parentEl, componentOptions, _pathOptions);
        this.renderItems();
    }

    protected getItems(data: HexerData): Path[] {
        return this._pathOptions.getPaths(data);
    }

    protected addItem() {
        const data = this._componentOptions.getDataClone();
        const newPath = new Path(this._pathOptions.addLabel);
        this._pathOptions.getPaths(data).push(newPath);
        this._componentOptions.setData(data);
        this.setActivePath(newPath);
        this.renderItems();
    }

    protected renderRow(listEl: HTMLElement, path: Path) {
        const activePath = this._componentOptions.getEditorState().activePath;
        new SidebarListRow<Path>(listEl, {
            disableEdit: activePath !== null && activePath.pathId !== path.id,
            editMode: activePath?.pathId === path.id,
            item: path,
            obsidian: this._componentOptions.obsidian,
            getId: item => item.id,
            getName: item => item.name,
            getColour: item => item.color,
            getFilePath: item => item.filePath,
            onEdit: this.editPath.bind(this),
            onFinish: this.closePath.bind(this),
            onColourPicked: colour => this.savePath(path, colour),
            onSettings: item => this._componentOptions.obsidian.openItemSettings({
                settings: { name: item.name, filePath: item.filePath },
                onSave: settings => this.savePathSettings(item.id, settings),
            }),
        });
    }

    private setActivePath(path: Path | null) {
        const state = this._componentOptions.getEditorState();
        if(path === null) {
            state.activePath = null;
        }
        else {
            state.activePath = { pathId: path.id, activeNode: null };
        }
        this._componentOptions.setEditorState(state);
    }

    private editPath(pathId: string) {
        const data = this._componentOptions.getDataClone();
        const path = this._pathOptions.getPaths(data).find(p => p.id === pathId) ?? null;
        this.setActivePath(path);
        this.renderItems();
    }

    private closePath() {
        this.setActivePath(null);
        this.renderItems();
    }

    private savePath(path: Path, colour: string) {
        const data = this._componentOptions.getDataClone();
        const target = [...data.rivers, ...data.roads].find(p => p.id === path.id);
        if(!target) {
            return;
        }

        target.color = colour;
        this._componentOptions.setData(data);
    }

    private savePathSettings(pathId: string, settings: ItemSettings) {
        const data = this._componentOptions.getDataClone();
        const target = [...data.rivers, ...data.roads].find(p => p.id === pathId);
        if(!target) {
            return;
        }

        target.name = settings.name;
        target.filePath = settings.filePath;

        this._componentOptions.setData(data);
        this.renderItems();
    }
}
