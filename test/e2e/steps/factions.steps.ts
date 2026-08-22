import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import factionPage from '../support/faction.page';
import itemSettingsPage from '../support/itemSettings.page';
import { createNote } from '../support/obsidian.page';
import { FactionsContext } from '../support/contexts/factions.context';

Given('I am editing the faction {string}', async function (this: FactionsContext, name: string) {
    await factionPage.seedFactions();
    await editorPage.selectLayer('faction');
    const factions = await factionPage.getFactions();
    const faction = factions.find(candidate => candidate.name === name);
    expect(faction).toBeDefined();
    this.selectedFaction = faction;
    await factionPage.editFaction(faction!.id);
});

When('I create a new faction', async function (this: FactionsContext) {
    await factionPage.createFaction();
    const factions = await factionPage.getFactions();
    this.selectedFaction = factions[0];
});

When('I edit the faction\'s information', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    await factionPage.openFactionSettings(this.selectedFaction!.id);
});

When('I change the faction\'s name to {string}', async function (this: FactionsContext, name: string) {
    await itemSettingsPage.setName(name);
    this.expectedName = name;
});

When('I attach a note to the faction', async function (this: FactionsContext) {
    const notePath = 'The Iron Concord.md';
    await createNote(notePath, '# The Iron Concord\n');
    await itemSettingsPage.attachNote('The Iron Concord');
    this.attachedNotePath = notePath;
});

When('I save the faction settings', async function () {
    await itemSettingsPage.save();
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

Then('the faction is updated with the new name', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.expectedName).toBeDefined();
    const faction = await factionPage.getFaction(this.selectedFaction!.id);
    expect(faction).toBeDefined();
    expect(faction!.name).toBe(this.expectedName);
});

Then('I can view the faction\'s attached note', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.attachedNotePath).toBeDefined();
    const faction = await factionPage.getFaction(this.selectedFaction!.id);
    expect(faction).toBeDefined();
    expect(faction!.filePath).toBe(this.attachedNotePath);
});

When('I click a hex with a faction', async function (this: FactionsContext) {
    const hex = { q: 1, r: 1 };
    await editorPage.clickHex(hex);
    this.lastClickedHex = hex;
});

Then('the faction is added to the hex', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.factionId).toBe(this.selectedFaction!.id);
});

Then('the faction is removed from the hex', async function (this: FactionsContext) {
    expect(this.lastClickedHex).toBeDefined();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex).toBeDefined();
    expect(hex!.factionId).toBeNull();
});

Then('the faction is added to every hovered hex', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.lastDraggedHexes).toBeDefined();
    for(const coordinates of this.lastDraggedHexes!) {
        const hex = await editorPage.getHex(coordinates);
        expect(hex?.factionId).toBe(this.selectedFaction!.id);
    }
});
