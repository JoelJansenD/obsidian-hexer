import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import modePage from '../support/mode.page';
import factionPage from '../support/faction.page';
import itemSettingsPage from '../support/itemSettings.page';
import { createNote } from '../support/obsidian.page';
import { FactionsContext } from '../support/contexts/factions.context';

Given('I am editing the faction {string}', async function (this: FactionsContext, name: string) {
    await factionPage.seedFactions();
    // Seeding reopens the map, which rebuilds the editor in view mode, so re-enter
    // edit mode before reaching for the sidebar.
    await modePage.switchTo('edit');
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

When('I click and drag across multiple hexes with a faction', async function (this: FactionsContext) {
    // The first seeded faction claims hexes 1,1 / 2,1 / 2,2 (see the fixture),
    // so dragging across them erases a faction from every hovered hex.
    const hexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }];
    await editorPage.dragAcrossHexes(hexes);
    this.lastDraggedHexes = hexes;
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

Then('the faction is removed from every dragged hex', async function (this: FactionsContext) {
    expect(this.lastDraggedHexes).toBeDefined();
    for(const coordinates of this.lastDraggedHexes!) {
        const hex = await editorPage.getHex(coordinates);
        expect(hex).toBeDefined();
        expect(hex!.factionId).toBeNull();
    }
});

When('I click an existing hex', async function (this: FactionsContext) {
    // The first seeded faction (The Verdant Circle) claims the connected region
    // 1,1 / 2,1 / 2,2 (see the fixture), so clicking any of them floods the whole
    // region. 3,1 is a neighbouring hex with no faction, left as the control.
    const hex = { q: 1, r: 1 };
    const before = await editorPage.getHex(hex);
    expect(before?.factionId).toBeTruthy();
    this.originalFaction = await factionPage.getFaction(before!.factionId!);
    expect(this.originalFaction).toBeDefined();
    this.lastClickedHex = hex;
    this.regionHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }];
    await editorPage.clickHex(hex);
});

When('I click a non-existent hex', async function (this: FactionsContext) {
    // The fixture only seeds hexes 1,1 / 2,1 / 2,2 / 3,1, so the hex at the centre
    // of the camera view is empty while staying within the canvas so it can be
    // clicked regardless of how the camera has panned.
    const hex = await editorPage.hexInView();
    // Snapshot the seeded region so the assertion can prove it stays untouched
    // even though a different faction is active.
    this.regionHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }];
    const before = await editorPage.getHex(this.regionHexes[0]);
    this.originalFaction = await factionPage.getFaction(before!.factionId!);
    expect(this.originalFaction).toBeDefined();
    this.lastClickedHex = hex;
    await editorPage.clickHex(hex);
});

Then('nothing changes', async function (this: FactionsContext) {
    expect(this.lastClickedHex).toBeDefined();
    expect(this.originalFaction).toBeDefined();
    expect(this.regionHexes).toBeDefined();

    // The clicked hex was never created, so it still does not exist.
    const clicked = await editorPage.getHex(this.lastClickedHex!);
    expect(clicked).toBeNull();

    // The seeded region keeps its original faction — the fill did nothing.
    for(const coordinates of this.regionHexes!) {
        const hex = await editorPage.getHex(coordinates);
        expect(hex?.factionId).toBe(this.originalFaction!.id);
    }
});

Then('the connected hexes of the same faction are changed to the selected faction', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.originalFaction).toBeDefined();
    expect(this.regionHexes).toBeDefined();
    // The bucket fill only makes sense when it actually swaps one faction for another.
    expect(this.selectedFaction!.id).not.toBe(this.originalFaction!.id);

    for(const coordinates of this.regionHexes!) {
        const hex = await editorPage.getHex(coordinates);
        expect(hex?.factionId).toBe(this.selectedFaction!.id);
    }

    // A neighbouring hex outside the region keeps its (absent) faction.
    const outside = await editorPage.getHex({ q: 3, r: 1 });
    expect(outside?.factionId ?? null).toBeNull();
});

Then('the faction is added to every hovered hex', async function (this: FactionsContext) {
    expect(this.selectedFaction).toBeDefined();
    expect(this.lastDraggedHexes).toBeDefined();
    for(const coordinates of this.lastDraggedHexes!) {
        const hex = await editorPage.getHex(coordinates);
        expect(hex?.factionId).toBe(this.selectedFaction!.id);
    }
});
