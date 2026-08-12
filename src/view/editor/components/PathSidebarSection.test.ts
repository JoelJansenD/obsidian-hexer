// @vitest-environment happy-dom
import { Droplets } from "lucide";
import createHexerData from "../../../__test/createHexerData";
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { Path } from "../../../logic/path";
import { ObsidianInterop, PathSettingsOptions } from "../../ObsidianInterop";
import PathSidebarSection from "./PathSidebarSection";

const createPath = (name: string, color: string) => {
    const path = new Path(name);
    path.color = color;
    return path;
};

const createPathSection = (paths: Path[]) => {
    const componentOptions = createComponentOptions({}, createHexerData({ rivers: paths }));
    const openPathSettings = vi.fn<(options: PathSettingsOptions) => void>();
    componentOptions.obsidian = { openPathSettings } as unknown as ObsidianInterop;
    const parent = document.createElement('div');
    new PathSidebarSection(parent, componentOptions, {
        icon: Droplets,
        type: 'river',
        label: 'Rivers',
        newPathLabel: 'New river',
        getPaths: data => data.rivers,
    });
    return { parent, componentOptions, openPathSettings };
};

const readRows = (parent: HTMLElement) =>
    Array.from(parent.querySelectorAll<HTMLElement>('.hexer-path-row')).map(rowEl => ({
        name: rowEl.querySelector('.hexer-path-row-name')!.textContent,
        colour: rowEl.querySelector<HTMLInputElement>('.hexer-path-row-color')!.value,
    }));

const getRow = (parent: HTMLElement, path: Path) => {
    const rowEl = parent.querySelector<HTMLElement>(`[data-path-id="${path.id}"]`);
    expect(rowEl).not.toBeNull();
    return rowEl!;
};

const getColourInput = (parent: HTMLElement, path: Path) =>
    getRow(parent, path).querySelector<HTMLInputElement>('.hexer-path-row-color')!;

const clickButton = (parent: HTMLElement, path: Path, role: string) => {
    const buttonEl = getRow(parent, path).querySelector(`[data-role="${role}"]`);
    expect(buttonEl).not.toBeNull();
    buttonEl!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

const pickColour = (parent: HTMLElement, path: Path, colour: string) => {
    const inputEl = getColourInput(parent, path);
    inputEl.value = colour;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('Rows', () => {
    it('displays every row with its name and colour', () => {
        // Arrange
        const paths = [
            createPath('Silverflow', '#1122ff'),
            createPath('Mudbrook', '#8b4513'),
            createPath('Frostrun', '#00ffee'),
        ];

        // Act
        const { parent } = createPathSection(paths);

        // Assert
        expect(readRows(parent)).toEqual([
            { name: 'Silverflow', colour: '#1122ff' },
            { name: 'Mudbrook', colour: '#8b4513' },
            { name: 'Frostrun', colour: '#00ffee' },
        ]);
    });
});

describe('Edit mode', () => {
    it('opens edit mode for the path that is clicked', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff'), createPath('Mudbrook', '#8b4513')];
        const { parent, componentOptions } = createPathSection(paths);

        // Act
        clickButton(parent, paths[0], 'edit-path');

        // Assert
        expect(getRow(parent, paths[0]).dataset.editing).toBe('true');
        expect(getColourInput(parent, paths[0]).disabled).toBe(false);
        expect(componentOptions.getEditorState().activePath).toEqual({ pathId: paths[0].id, activeNode: null });
    });

    it('leaves the other paths untouched while one is edited', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff'), createPath('Mudbrook', '#8b4513')];
        const { parent } = createPathSection(paths);

        // Act
        clickButton(parent, paths[0], 'edit-path');

        // Assert
        const otherRowEl = getRow(parent, paths[1]);
        expect(otherRowEl.dataset.editing).toBe('false');
        expect(getColourInput(parent, paths[1]).disabled).toBe(true);
        expect(otherRowEl.querySelector<HTMLElement>('[data-role="edit-path"]')!.style.display).toBe('none');
    });

    it('closes edit mode when the edit is finished', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff')];
        const { parent, componentOptions } = createPathSection(paths);
        clickButton(parent, paths[0], 'edit-path');

        // Act
        clickButton(parent, paths[0], 'save-path');

        // Assert
        expect(getRow(parent, paths[0]).dataset.editing).toBe('false');
        expect(getColourInput(parent, paths[0]).disabled).toBe(true);
        expect(componentOptions.getEditorState().activePath).toBeNull();
    });

    it('stores the colour picked while editing', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff')];
        const { parent, componentOptions } = createPathSection(paths);
        clickButton(parent, paths[0], 'edit-path');

        // Act
        pickColour(parent, paths[0], '#00ff00');

        // Assert
        expect(componentOptions.setData).toHaveBeenCalled();
        expect(componentOptions.getDataClone().rivers[0].color).toBe('#00ff00');
    });

    it('keeps the stored colour after edit mode is closed', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff')];
        const { parent } = createPathSection(paths);
        clickButton(parent, paths[0], 'edit-path');
        pickColour(parent, paths[0], '#00ff00');

        // Act
        clickButton(parent, paths[0], 'save-path');

        // Assert
        expect(getColourInput(parent, paths[0]).value).toBe('#00ff00');
    });
});

describe('Configuration modal', () => {
    const openModal = (paths: Path[]) => {
        const section = createPathSection(paths);
        clickButton(section.parent, paths[0], 'edit-path');
        clickButton(section.parent, paths[0], 'path-settings');
        return section;
    };

    it('opens the modal for the path being edited', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff'), createPath('Mudbrook', '#8b4513')];

        // Act
        const { openPathSettings } = openModal(paths);

        // Assert
        expect(openPathSettings).toHaveBeenCalledTimes(1);
        expect(openPathSettings.mock.calls[0][0].path.id).toBe(paths[0].id);
    });

    it('applies the name and note chosen in the modal', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff')];
        const { parent, componentOptions, openPathSettings } = openModal(paths);
        const edited = openPathSettings.mock.calls[0][0].path.clone();
        edited.name = 'Quicksilver';
        edited.filePath = 'Rivers/Quicksilver.md';

        // Act
        openPathSettings.mock.calls[0][0].onSave!(edited);

        // Assert
        expect(getRow(parent, paths[0]).querySelector('.hexer-path-row-name')!.textContent).toBe('Quicksilver');
        expect(componentOptions.setData).toHaveBeenCalled();
        expect(componentOptions.getDataClone().rivers[0].filePath).toBe('Rivers/Quicksilver.md');
    });

    it('links the note on the row once the edit is finished', () => {
        // Arrange
        const paths = [createPath('Silverflow', '#1122ff')];
        const { parent, openPathSettings } = openModal(paths);
        const edited = openPathSettings.mock.calls[0][0].path.clone();
        edited.filePath = 'Rivers/Quicksilver.md';
        openPathSettings.mock.calls[0][0].onSave!(edited);

        // Act
        clickButton(parent, paths[0], 'save-path');

        // Assert
        expect(getRow(parent, paths[0]).querySelector('[data-role="view-file"]')).not.toBeNull();
    });
});
