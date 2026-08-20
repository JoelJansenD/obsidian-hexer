import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import factionPage from '../support/faction.page';
import itemSettingsPage from '../support/itemSettings.page';
import { createNote } from '../support/obsidian.page';
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

// Creating a faction opens it in edit mode, which is what makes it the active
// one, so a freshly created faction is all this needs.
Given('I have an active faction', async function (this: FactionsContext) {
    await factionPage.createFaction();
    const factions = await factionPage.getFactions();
    expect(factions.length).toBe(1);
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

Then('the faction is added to the hex', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.factionId).toBe(this.selectedFaction!.id);
});

const REPLACEMENT_HEX = { q: 3, r: 3 };

Given('a hex already belongs to another faction', async function (this: FactionsContext) {
    await factionPage.createFaction();
    const factions = await factionPage.getFactions();
    this.originalFaction = factions[0];

    await editorPage.clickHex(REPLACEMENT_HEX);
    this.lastClickedHex = REPLACEMENT_HEX;

    const hex = await editorPage.getHex(REPLACEMENT_HEX);
    expect(hex?.factionId).toBe(this.originalFaction!.id);
});

// Creating a faction makes it the active one, so this leaves a second, distinct
// faction selected while the first is the one already painted onto the hex.
Given('I have selected a different faction', async function (this: FactionsContext) {
    expect(this.originalFaction).toBeDefined();
    await factionPage.createFaction();
    const factions = await factionPage.getFactions();
    this.selectedFaction = factions.find(faction => faction.id !== this.originalFaction!.id);
    expect(this.selectedFaction).toBeDefined();
});

When('I click that hex', async function (this: FactionsContext) {
    expect(this.lastClickedHex).toBeDefined();
    await editorPage.clickHex(this.lastClickedHex!);
});

Then('the original faction is replaced with the new faction', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.originalFaction).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.factionId).toBe(this.selectedFaction!.id);
    expect(hex?.factionId).not.toBe(this.originalFaction!.id);
});
