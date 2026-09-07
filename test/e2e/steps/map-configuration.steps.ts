import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import mapSettingsPage from '../support/mapSettings.page';

When('I change the map name to {string}', async function (name: string) {
    await mapSettingsPage.open();
    await mapSettingsPage.setName(name);
    // A blank name is invalid: Save is disabled, so leave the modal open for the
    // validation-message assertion. A valid name is committed straight away.
    if (name.length > 0) {
        await mapSettingsPage.save();
    }
});

When('I set the hex orientation to pointy top', async function () {
    await mapSettingsPage.open();
    await mapSettingsPage.setOrientation('pointy-top');
    await mapSettingsPage.save();
});

Then('the map name is updated to {string}', async function (name: string) {
    expect(await mapSettingsPage.mapName()).toBe(name);
});

Then('the hex orientation is pointy top', async function () {
    expect(await mapSettingsPage.hexOrientation()).toBe('pointy-top');
});

Then('a validation message is shown', async function () {
    const message = await mapSettingsPage.validationMessage();
    expect(message.trim().length).toBeGreaterThan(0);
});
