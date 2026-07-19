import { Given, When, Then } from '@wdio/cucumber-framework';
import { clickHex, getHex, selectLayer, selectPaintTool, terrainLayer } from '../support/editor.page';

const EMPTY_HEX = { q: 1, r: 1 };

Given('I have selected the brush tool', async function () {
    await selectPaintTool('brush');
});

Given('I have selected the terrain layer', async function () {
    await selectLayer('terrain');
});

Given('my selected colour is blue', async function () {
    await terrainLayer.colourPicker().setValue('#0000ff');
});

When('I click an empty hex', async function () {
    await clickHex(EMPTY_HEX);
});

Then('the hex terrain will be painted blue', async function () {
    const hex = await getHex(EMPTY_HEX);
    if (!hex || hex.terrainColor !== '#0000ff') {
        throw new Error(`Expected hex ${EMPTY_HEX.q},${EMPTY_HEX.r} to be painted blue (#0000ff) but got "${hex?.terrainColor}"`);
    }
});
