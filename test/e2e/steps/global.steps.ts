import { Given, When } from "@wdio/cucumber-framework";
import { obsidianPage } from 'wdio-obsidian-service';
import { fileExplorer } from '../support/obsidian.page';
import { CURRENT_VERSION } from '../../../src/logic/HexerData';
import editorPage from "../support/editor.page";
import { Layer } from "../../../src/logic/EditorState";
import { TestContext } from "../support/TestContext";

const HEXER_EXT = '.hexer.md';
const EMPTY_HEX = { q: 5, r: 5 };

// CI runs Obsidian in a smaller window than a typical local setup, which shrinks
// the canvas so hexes further from the origin fall outside it and can't be
// clicked. `browser.maximizeWindow()` isn't supported by Obsidian's Electron
// automation, so resize the window through Electron's remote API instead.
async function maximizeObsidianWindow() {
    await browser.executeObsidian(({ require }) => {
        const win = require('electron').remote.getCurrentWindow();
        win.maximize();
    });
}

Given('I have opened a Hexer file', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await maximizeObsidianWindow();

    const fileContent = [
        '---',
        'hexer:',
        `  version: "${CURRENT_VERSION}"`,
        '  size: 50',
        '  hexes:',
        '    "1,1":',
        '      q: 1',
        '      r: 1',
        '      terrainColor: "#ff0000"',
        '    "2,1":',
        '      q: 2',
        '      r: 1',
        '      terrainColor: "#ff0000"',
        '    "2,2":',
        '      q: 2',
        '      r: 2',
        '      terrainColor: "#ff0000"',
        '    "3,1":',
        '      q: 3',
        '      r: 1',
        '      terrainColor: "#ff0000"',
        '---',
        '',
    ].join('\n');

    await obsidianPage.write(`test${HEXER_EXT}`, fileContent);
    await fileExplorer.fileByExtension(HEXER_EXT).click();

    const canvasSize = await browser.executeObsidian(({ app }) => {
        const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
        const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
        return canvas
            ? { clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight, dpr: window.devicePixelRatio }
            : null;
    });
    console.debug('[hexer-e2e] opened Hexer file', JSON.stringify({ canvasSize, fileContent }));
});

Given('I have selected the {word} layer', async function (layer: Layer) {
    await editorPage.selectLayer(layer);
});

Given('Obsidian is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await maximizeObsidianWindow();
});

When('I click an empty hex', async function (this: TestContext) {
    await editorPage.clickHex(EMPTY_HEX);
    this.lastClickedHex = EMPTY_HEX;
});
