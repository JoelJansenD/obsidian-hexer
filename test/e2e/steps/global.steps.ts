import { Given, When } from "@wdio/cucumber-framework";
import { obsidianPage } from 'wdio-obsidian-service';
import { fileExplorer } from '../support/obsidian.page';
import editorPage from "../support/editor.page";
import { Layer, PaintTool } from "../../../src/logic/EditorState";
import { GlobalContext } from "../support/contexts/global.context";
import { buildHexerFileContent } from "../support/fixture";

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

    // Rivers are defined per-scenario (see the "with the following nodes" steps),
    // so the file opens with none.
    const fileContent = buildHexerFileContent();

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
    const hex = await editorPage.hexInView();
    await editorPage.clickHex(hex);
    this.lastClickedHex = hex;
});

When('I click a hex at {int},{int}', async function (this: GlobalContext, q: number, r: number) {
    const hex = { q, r };
    await editorPage.clickHex(hex);
    this.lastClickedHex = hex;
});

When('I click and drag across multiple hexes', async function (this: GlobalContext) {
    const DRAG_HEXES = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 3, r: 1 }];
    await editorPage.dragAcrossHexes(DRAG_HEXES);
    this.lastDraggedHexes = DRAG_HEXES;
});
