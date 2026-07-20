import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import { PaintTool } from '../../../src/logic/EditorState';
import { clickHex, dragAcrossHexes, getHex, logHexerState, selectLayer, selectPaintTool, setTerrainColour } from '../support/editor.page';

const EMPTY_HEX = { q: 5, r: 5 };
let lastClickedHex: { q: number, r: number } | null = null;
let lastDraggedHexes: { q: number, r: number }[] = [];

Given('I have selected the {word} tool', async function (tool: PaintTool) {
    await selectPaintTool(tool);
});

Given('I have selected the terrain layer', async function () {
    await selectLayer('terrain');
});

Given('my selected colour is blue', async function () {
    await setTerrainColour('#0000ff');
    console.debug('[hexer-e2e] set terrain colour to #0000ff');
    await logHexerState('initial (colour selected)');
});

When('I click an empty hex', async function () {
    await clickHex(EMPTY_HEX);
    lastClickedHex = EMPTY_HEX;
});

When('I click a hex with coloured terrain', async function () {
    await clickHex({ q: 2, r: 2 });
    lastClickedHex = { q: 2, r: 2 };
});

When('I click and drag across multiple hexes', async function () {
    const DRAG_HEXES = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 3, r: 1 }];
    await dragAcrossHexes(DRAG_HEXES);
    lastDraggedHexes = DRAG_HEXES;
});

Then('every hovered hex terrain will be painted blue', async function () {
    for (const hex of lastDraggedHexes) {
        const result = await getHex(hex);
        expect(result?.terrainColor).toBe('#0000ff');
    }
});

Then('the hex terrain will be painted blue', async function () {
    expect(lastClickedHex).not.toBeNull();
    const hex = await getHex(lastClickedHex!);
    expect(hex?.terrainColor).toBe('#0000ff');
});

Then('the hex terrain will be erased', async function () {
    expect(lastClickedHex).not.toBeNull();
    const result = await getHex(lastClickedHex!);
    expect(result).toBeNull();
});

Then('every hovered hex terrain will be erased', async function () {
    for (const hex of lastDraggedHexes) {
        const result = await getHex(hex);
        expect(result).toBeNull();
    }
});

Then('every connected hex with the same terrain colour will be painted blue', async function () {
    const connectedHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }, { q: 3, r: 1 }];
    for (const hex of connectedHexes) {
        const result = await getHex(hex);
        expect(result?.terrainColor).toBe('#0000ff');
    }
});
