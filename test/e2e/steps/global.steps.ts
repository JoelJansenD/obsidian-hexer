import { Given } from "@wdio/cucumber-framework";
import { obsidianPage } from 'wdio-obsidian-service';
import { fileExplorer } from '../support/obsidian.page';
import { CURRENT_VERSION } from '../../../src/logic/HexerData';

const HEXER_EXT = '.hexer.md';

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
        '    "2,2":',
        '      q: 2',
        '      r: 2',
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

Given('Obsidian is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await maximizeObsidianWindow();
});
