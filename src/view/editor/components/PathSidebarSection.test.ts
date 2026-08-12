// @vitest-environment happy-dom
import { Droplets } from "lucide";
import createHexerData from "../../../__test/createHexerData";
import { createComponentOptions } from "../../../__test/defaultEditorState";
import { Path } from "../../../logic/path";
import PathSidebarSection from "./PathSidebarSection";

const createPath = (name: string, color: string) => {
    const path = new Path(name);
    path.color = color;
    return path;
};

const createPathSection = (paths: Path[]) => {
    const componentOptions = createComponentOptions({}, createHexerData({ rivers: paths }));
    const parent = document.createElement('div');
    new PathSidebarSection(parent, componentOptions, {
        icon: Droplets,
        type: 'river',
        label: 'Rivers',
        newPathLabel: 'New river',
        getPaths: data => data.rivers,
    });
    return { parent, componentOptions };
};

const readRows = (parent: HTMLElement) =>
    Array.from(parent.querySelectorAll<HTMLElement>('.hexer-path-row')).map(rowEl => ({
        name: rowEl.querySelector('.hexer-path-row-name')!.textContent,
        colour: rowEl.querySelector<HTMLInputElement>('.hexer-path-row-color')!.value,
    }));

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
