import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import { PaintTool } from '../../../src/logic/EditorState';
import editorPage from '../support/editor.page';
import terrainPage from '../support/terrain.page';
import { TestContext } from '../support/TestContext';
import { colourToHex } from '../support/colours';

Given('I have selected the {word} tool', async function (tool: PaintTool) {
    await editorPage.selectPaintTool(tool);
});

Given('my selected colour is blue', async function () {
    await terrainPage.setColour(colourToHex('blue'));
    console.debug(`[hexer-e2e] set terrain colour to ${colourToHex('blue')}`);
    await editorPage.logHexerState('initial (colour selected)');
});

When('I click a hex with coloured terrain', async function (this: TestContext) {
    await editorPage.clickHex({ q: 2, r: 2 });
    this.lastClickedHex = { q: 2, r: 2 };
});

When('I click and drag across multiple hexes', async function (this: TestContext) {
    const DRAG_HEXES = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 3, r: 1 }];
    await editorPage.dragAcrossHexes(DRAG_HEXES);
    this.lastDraggedHexes = DRAG_HEXES;
});

Then('every hovered hex terrain will be painted blue', async function (this: TestContext) {
    for (const hex of this.lastDraggedHexes || []) {
        const result = await editorPage.getHex(hex);
        expect(result?.terrainColor).toBe(colourToHex('blue'));
    }
});

Then('the hex terrain will be painted blue', async function (this: TestContext) {
    expect(this.lastClickedHex).not.toBeNull();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.terrainColor).toBe(colourToHex('blue'));
});

Then('the hex terrain will be erased', async function (this: TestContext) {
    expect(this.lastClickedHex).not.toBeNull();
    const result = await editorPage.getHex(this.lastClickedHex!);
    expect(result).toBeNull();
});

Then('every hovered hex terrain will be erased', async function (this: TestContext) {
    for (const hex of this.lastDraggedHexes || []) {
        const result = await editorPage.getHex(hex);
        expect(result).toBeNull();
    }
});

Then('every connected hex with the same terrain colour will be painted blue', async function () {
    const connectedHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }, { q: 3, r: 1 }];
    for (const hex of connectedHexes) {
        const result = await editorPage.getHex(hex);
        expect(result?.terrainColor).toBe(colourToHex('blue'));
    }
});
