import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';

const COMMAND_ID = 'obsidian-hexer:open-hexer-view';

Given('the Hexer view is open', async function () {
    await browser.reloadObsidian({ vault: './test/vault' });
    await browser.executeObsidianCommand(COMMAND_ID);
});

When('I click the hex', async function () {
    const canvas = await browser.$('canvas[data-color-index]');
    await canvas.click();
});

When('I click the hex {int} times', async function (times: number) {
    const canvas = await browser.$('canvas[data-color-index]');
    for (let i = 0; i < times; i++) {
        await canvas.click();
    }
});

Then('the hex displays colour index {int}', async function (expectedIndex: number) {
    const canvas = await browser.$('canvas[data-color-index]');
    await expect(canvas).toHaveAttribute('data-color-index', String(expectedIndex));
});
