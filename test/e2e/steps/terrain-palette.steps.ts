import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import palettePage from '../support/palette.page';
import terrainPage from '../support/terrain.page';
import { colourToHex } from '../support/colours';
import { PaletteContext } from '../support/contexts/palette.context';

const TERRAIN = 'terrain';

// Gherkin numbers swatches from 1 for readability; the DOM indexes them from 0.
When('I select terrain palette swatch {int}', async function (this: PaletteContext, position: number) {
    const index = position - 1;
    this.selectedSwatchColour = await palettePage.swatchColour(TERRAIN, index);
    await palettePage.selectSwatch(TERRAIN, index);
});

Then('the hex terrain will match the selected palette swatch colour', async function (this: PaletteContext) {
    expect(this.lastClickedHex).toBeDefined();
    expect(this.selectedSwatchColour).toBeDefined();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.terrainColor?.toLowerCase()).toBe(this.selectedSwatchColour);
});

When('I override terrain palette swatch {int} with {word}', async function (position: number, colour: string) {
    // Right-click copies the active colour into the swatch, so make the colour
    // active first, then right-click to override.
    await terrainPage.setColour(colourToHex(colour));
    await palettePage.overrideSwatch(TERRAIN, position - 1);
});

Then('terrain palette swatch {int} will show {word}', async function (position: number, colour: string) {
    const shown = await palettePage.swatchColour(TERRAIN, position - 1);
    expect(shown).toBe(colourToHex(colour));
});
