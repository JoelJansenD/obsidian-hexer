import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import factionPage from '../support/faction.page';
import { FactionsContext } from '../support/contexts/factions.context';

When('I create a new faction', async function (this: FactionsContext) {
    await factionPage.createFaction();
    const factions = await factionPage.getFactions();
    this.selectedFaction = factions[0];
});

Then('a new faction is created', async function () {
    const factions = await factionPage.getFactions();
    expect(factions.length).toBe(1);
});

Then('the faction is active', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    const factionEl = await factionPage.getFactionElement(this.selectedFaction!.id);
    await expect(factionEl).toHaveAttribute('data-editing', 'true');
});
