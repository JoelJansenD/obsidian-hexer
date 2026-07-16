import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';

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
