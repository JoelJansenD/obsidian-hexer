import { Given } from "@wdio/cucumber-framework";

const COMMAND_ID = 'obsidian-hexer:open-hexer-view';

Given('the Hexer view is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await browser.executeObsidianCommand(COMMAND_ID);
});

Given('Obsidian is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
});
