import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import pathPage from '../support/path.page';
import { TestContext } from '../support/TestContext';
import { EXISTING_RIVER_ID } from '../support/fixture';

When('I create a new river', async function (this: TestContext) {
    await pathPage.createRiver();
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers.find(river => river.id !== EXISTING_RIVER_ID);
});

Given('I have a river', async function (this: TestContext) {
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers.find(river => river.id === EXISTING_RIVER_ID);
    expect(this.selectedRiver).toBeDefined();
});

When('I edit the river', async function (this: TestContext) {
    expect(this.selectedRiver).toBeDefined();
    await pathPage.editRiver(this.selectedRiver!.id);
});

Then('a new river is created', async function () {
    const rivers = await pathPage.getRivers();
    const newRivers = rivers.filter(river => river.id !== EXISTING_RIVER_ID);
    expect(newRivers.length).toBe(1);
});

Then('the river is selected', async function (this: TestContext) {
    expect(this.selectedRiver).toBeDefined();
    const pathEl = await pathPage.getRiverElement(this.selectedRiver!.id);
    await expect(pathEl).toHaveAttribute('data-editing', 'true');
});
