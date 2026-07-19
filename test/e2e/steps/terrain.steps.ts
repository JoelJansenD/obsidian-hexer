import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import { clickHex, getHex, selectLayer, selectPaintTool, setTerrainColour } from '../support/editor.page';

const EMPTY_HEX = { q: 1, r: 1 };

Given('I have selected the brush tool', async function () {
    await selectPaintTool('brush');
});

Given('I have selected the terrain layer', async function () {
    await selectLayer('terrain');
});

Given('my selected colour is blue', async function () {
    await setTerrainColour('#0000ff');
});

When('I click an empty hex', async function () {
    await clickHex(EMPTY_HEX);
});

Then('the hex terrain will be painted blue', async function () {
    const hex = await getHex(EMPTY_HEX);
    expect(hex?.terrainColor).toBe('#0000ff');
});
