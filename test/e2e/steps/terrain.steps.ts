import { Given, When, Then } from '@wdio/cucumber-framework';
import { selectLayer, selectPaintTool, terrainLayer } from '../support/editor.page';

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
    return 'pending';
});

Then('the hex terrain will be painted blue', async function () {
    return 'pending';
});
