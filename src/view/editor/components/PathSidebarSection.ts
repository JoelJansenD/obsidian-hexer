import { createElement, Plus, type IconNode } from "lucide";
import EditorSidebarSection from "./EditorSidebarSection";
import PathRow from "./PathRow";
import { HexerData } from "../../../logic/HexerData";
import { ComponentOptions } from "../Editor";
import { Path, PathType } from "../../../logic/path";

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
    private _activePathId: string | null = null;

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

    private renderPaths() {
        const data = this._componentOptions.getData();
        this._pathsEl.empty();
        this._pathOptions.getPaths(data).forEach(path => {
            new PathRow(this._pathsEl, {
                disableEdit: this._activePathId !== null && this._activePathId !== path.id,
                editMode: this._activePathId === path.id,
                path,
                onEdit: this.editPath.bind(this),
                onSave: this.savePath.bind(this)
            });
        });
    }

    private createPath() {
        const data = this._componentOptions.getData();
        const newPath = new Path(this._pathOptions.newPathLabel);
        this._pathOptions.getPaths(data).push(newPath);
        this._componentOptions.setData(data);
        this._activePathId = newPath.id;
        this.renderPaths();
    }

    private editPath(pathId: string) {
        this._activePathId = pathId;
        this.renderPaths();
    }

    private savePath(path: Path) {
        const data = this._componentOptions.getData();
        const paths = this._pathOptions.getPaths(data);
        const index = paths.findIndex(p => p.id === path.id);
        if (index !== -1) {
            paths[index] = path;
            this._componentOptions.setData(data);
        }
        this._activePathId = null;
        this.renderPaths();
    }
}
