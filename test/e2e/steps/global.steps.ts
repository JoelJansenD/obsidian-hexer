import { Given, When } from "@wdio/cucumber-framework";
import { obsidianPage } from 'wdio-obsidian-service';
import { fileExplorer } from '../support/obsidian.page';
import { CURRENT_VERSION } from '../../../src/logic/HexerData';
import editorPage from "../support/editor.page";
import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { GlobalContext } from "../support/contexts/global.context";
import { EXISTING_RIVER_ID } from "../support/fixture";

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
        '      icon:',
        '        name: "dungeon-gate"',
        '        color: "#00ff00"',
        '    "2,1":',
        '      q: 2',
        '      r: 1',
        '      terrainColor: "#ff0000"',
        '      icon:',
        '        name: "dungeon-gate"',
        '        color: "#00ff00"',
        '    "2,2":',
        '      q: 2',
        '      r: 2',
        '      terrainColor: "#ff0000"',
        '      icon:',
        '        name: "dungeon-gate"',
        '        color: "#00ff00"',
        '    "3,1":',
        '      q: 3',
        '      r: 1',
        '      terrainColor: "#ff0000"',
        '      icon:',
        '        name: "dungeon-gate"',
        '        color: "#00ff00"',
        '  rivers:',
        `    - id: "${EXISTING_RIVER_ID}"`,
        '      name: "Existing river"',
        '      nodes:',
        '        "1,1":',
        '          q: 1',
        '          r: 1',
        '        "2,1":',
        '          q: 2',
        '          r: 1',
        '      edges:',
        '        - from: "1,1"',
        '          to: "2,1"',
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

Given('I have selected the {word} tool', async function (tool: PaintTool) {
    await editorPage.selectPaintTool(tool);
});

Given('Obsidian is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await maximizeObsidianWindow();
});

When('I click an empty hex', async function (this: GlobalContext) {
    await editorPage.clickHex(EMPTY_HEX);
    this.lastClickedHex = EMPTY_HEX;
});

When('I click and drag across multiple hexes', async function (this: GlobalContext) {
    const DRAG_HEXES = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 3, r: 1 }];
    await editorPage.dragAcrossHexes(DRAG_HEXES);
    this.lastDraggedHexes = DRAG_HEXES;
});
