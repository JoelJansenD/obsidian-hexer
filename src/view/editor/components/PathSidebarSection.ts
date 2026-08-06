import { createElement, Plus, type IconNode } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import PathRow from "./PathRow";
import { HexerData } from "../../../logic/HexerData";
import { ComponentOptions } from "../Editor";
import { Path, PathType } from "../../../logic/path";
import { EditorState } from "../../../logic/EditorState";

interface PathSidebarSectionOptions {
    icon: IconNode;
    label: string;
    type: PathType;
    /** Label for the add button and name given to a newly created path. */
    newPathLabel: string;
    /** Selects the paths array (rivers or roads) this section manages. */
    getPaths: (data: HexerData) => Path[];
    onSelect?: () => void;
}

/**
 * A sidebar section that lists the paths of a single layer (rivers or roads),
 * with an "add path" button. Shared by the river and road sections.
 */
export default class PathSidebarSection extends EditorSidebarSection {
    private _pathsEl!: HTMLDivElement;

    constructor(
        parentEl: HTMLElement,
        private _componentOptions: ComponentOptions,
        private _pathOptions: PathSidebarSectionOptions,
    ) {
        super(parentEl, {
            icon: _pathOptions.icon,
            label: _pathOptions.label,
            layer: _pathOptions.type,
            onSelect: _pathOptions.onSelect,
        });
        this.buildPathContent();
    }

    private buildPathContent() {
        const addPathButton = this.contentEl.createDiv({ cls: 'hexer-sidebar-add-path' });
        addPathButton.dataset.role = `add-${this._pathOptions.type}`;
        addPathButton.appendChild(createElement(Plus, { height: 14, width: 14 }));
        addPathButton.createEl('span', { text: this._pathOptions.newPathLabel });
        addPathButton.addEventListener('click', this.createPath.bind(this));

        this._pathsEl = this.contentEl.createDiv({ cls: 'hexer-sidebar-section-padded' });
        this.renderPaths();
    }

    /** Re-renders the path list, e.g. after the active path is cleared elsewhere. */
    public refresh() {
        this.renderPaths();
    }

    private renderPaths() {
        const data = this._componentOptions.getData();
        const state = this._componentOptions.getEditorState()
        const activePath = state.activePath;
        this._pathsEl.empty();
        this._pathOptions.getPaths(data).forEach(path => {
            new PathRow(this._pathsEl, {
                disableEdit: activePath !== null && activePath.path.id !== path.id,
                editMode: activePath?.path.id === path.id,
                path,
                onEdit: this.editPath.bind(this),
                onFinish: this.closePath.bind(this),
                onSave: (() => this.savePath(path)).bind(this)
            });
        });
    }

    private setActivePath(path: Path | null) {
        const state = this._componentOptions.getEditorState();
        if(path === null) {
            state.activePath = null;
        }
        else {
            state.activePath = { path: path, activeNode: null };
        }
        this._componentOptions.setEditorState(state);
    }

    private createPath() {
        const data = this._componentOptions.getData();
        const newPath = new Path(this._pathOptions.newPathLabel);
        this._pathOptions.getPaths(data).push(newPath);
        this._componentOptions.setData(data);
        this.setActivePath(newPath);
        this.renderPaths();
    }

    private editPath(pathId: string) {
        const data = this._componentOptions.getData();
        const path = this._pathOptions.getPaths(data).find(p => p.id === pathId) ?? null;
        this.setActivePath(path);
        this.renderPaths();
    }

    private closePath() {
        this.setActivePath(null);
        this.renderPaths();
    }

    private savePath(path: Path) {
        const data = this._componentOptions.getData();
        const targetRiver = data.rivers.findIndex(r => r.id === path.id);
        if(targetRiver !== -1) {
            data.rivers[targetRiver] = path;
        }
        else {
            const targetRoad = data.roads.findIndex(r => r.id === path.id);
            if(targetRoad !== -1) {
                data.roads[targetRoad] = path;
            }
        }
        this._componentOptions.setData(data);
    }
}
