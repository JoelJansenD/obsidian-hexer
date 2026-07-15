import { browser } from '@wdio/globals';

const COMMAND_ID = 'obsidian-hexer:open-hexer-view';

describe('HexerView', function () {
    beforeEach(async function () {
        await browser.reloadObsidian({ vault: './test/vault' });
        await browser.executeObsidianCommand(COMMAND_ID);
    });

    it('opens a canvas with data-color-index attribute', async function () {
        const canvas = await browser.$('canvas[data-color-index]');
        await expect(canvas).toExist();
    });

    it('starts at colorIndex 0', async function () {
        const canvas = await browser.$('canvas[data-color-index]');
        await expect(canvas).toHaveAttribute('data-color-index', '0');
    });

    it('advances colorIndex on click', async function () {
        const canvas = await browser.$('canvas[data-color-index]');
        await canvas.click();
        await expect(canvas).toHaveAttribute('data-color-index', '1');
    });

    it('wraps back to 0 after 7 clicks', async function () {
        const canvas = await browser.$('canvas[data-color-index]');
        for (let i = 0; i < 7; i++) {
            await canvas.click();
        }
        await expect(canvas).toHaveAttribute('data-color-index', '0');
    });
});
