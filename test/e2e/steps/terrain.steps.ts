import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import terrainPage from '../support/terrain.page';
import { TerrainContext } from '../support/contexts/terrain.context';
import { colourToHex } from '../support/colours';

Given('my selected colour is blue', async function () {
    await terrainPage.setColour(colourToHex('blue'));
    console.debug(`[hexer-e2e] set terrain colour to ${colourToHex('blue')}`);
    await editorPage.logHexerState('initial (colour selected)');
});

When('I click a hex with coloured terrain', async function (this: TerrainContext) {
    await editorPage.clickHex({ q: 2, r: 2 });
    this.lastClickedHex = { q: 2, r: 2 };
});

Then('every hovered hex terrain will be painted blue', async function (this: TerrainContext) {
    for (const hex of this.lastDraggedHexes || []) {
        const result = await editorPage.getHex(hex);
        expect(result?.terrainColor).toBe(colourToHex('blue'));
    }
});

Then('the hex terrain will be painted blue', async function (this: TerrainContext) {
    expect(this.lastClickedHex).not.toBeNull();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.terrainColor).toBe(colourToHex('blue'));
});

Then('the hex terrain will be erased', async function (this: TerrainContext) {
    expect(this.lastClickedHex).not.toBeNull();
    const result = await editorPage.getHex(this.lastClickedHex!);
    expect(result?.terrainColor || null).toBeNull();
});

Then('every hovered hex terrain will be erased', async function (this: TerrainContext) {
    for (const hex of this.lastDraggedHexes || []) {
        const result = await editorPage.getHex(hex);
        expect(result?.terrainColor).toBeNull();
    }
});

Then('every connected hex with the same terrain colour will be painted blue', async function () {
    const connectedHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }, { q: 3, r: 1 }];
    for (const hex of connectedHexes) {
        const result = await editorPage.getHex(hex);
        expect(result?.terrainColor).toBe(colourToHex('blue'));
    }
});
