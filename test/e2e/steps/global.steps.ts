import { Given } from "@wdio/cucumber-framework";
import { obsidianPage } from 'wdio-obsidian-service';
import { fileExplorer } from '../support/obsidian.page';
import { CURRENT_VERSION } from '../../../src/logic/HexerData';

const HEXER_EXT = '.hexer.md';

Given('I have opened a Hexer file', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });

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
});

Given('Obsidian is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
});
