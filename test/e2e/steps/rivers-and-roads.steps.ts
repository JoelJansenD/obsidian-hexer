import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import pathPage from '../support/path.page';
import { RiversAndRoadsContext } from '../support/contexts/rivers-and-roads.context';
import { EXISTING_RIVER_ID } from '../support/fixture';
import { hexKey } from '../../../src/logic/HexerData';

// Far enough from the fixture river's nodes that a click on it can't be read as
// connecting to one, so the scenario only exercises adding a node.
const UNCONNECTED_HEX = { q: 5, r: 5 };

// A node the fixture river already has, so the active hex is an existing one
// rather than one the scenario had to create first.
const EXISTING_RIVER_HEX = { q: 1, r: 1 };

// A neighbour of EXISTING_RIVER_HEX that no fixture edge touches — the fixture's
// only edge runs from "1,1" to "2,1".
const NEIGHBOURING_HEX = { q: 0, r: 1 };

When('I create a new river', async function (this: RiversAndRoadsContext) {
    await pathPage.createRiver();
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers.find(river => river.id !== EXISTING_RIVER_ID);
});

Given('I have a river', async function (this: RiversAndRoadsContext) {
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers.find(river => river.id === EXISTING_RIVER_ID);
    expect(this.selectedRiver).toBeDefined();
});

Given('I am editing a river', async function (this: RiversAndRoadsContext) {
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers.find(river => river.id === EXISTING_RIVER_ID);
    expect(this.selectedRiver).toBeDefined();
    await pathPage.editRiver(this.selectedRiver!.id);
});

When('I edit the river', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    await pathPage.editRiver(this.selectedRiver!.id);
});

When('I click on a hex', async function (this: RiversAndRoadsContext) {
    await editorPage.clickHex(UNCONNECTED_HEX);
    this.lastClickedHex = UNCONNECTED_HEX;
});

Given('I have clicked on a hex', async function (this: RiversAndRoadsContext) {
    await editorPage.clickHex(EXISTING_RIVER_HEX);
    this.lastClickedHex = EXISTING_RIVER_HEX;
});

When('I click on another hex that is not part of any edge', async function (this: RiversAndRoadsContext) {
    expect(this.lastClickedHex).toBeDefined();
    await editorPage.clickHex(NEIGHBOURING_HEX);
    this.previouslyClickedHex = this.lastClickedHex;
    this.lastClickedHex = NEIGHBOURING_HEX;
});

Then('a new river is created', async function () {
    const rivers = await pathPage.getRivers();
    const newRivers = rivers.filter(river => river.id !== EXISTING_RIVER_ID);
    expect(newRivers.length).toBe(1);
});

Then('the river is selected', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    const pathEl = await pathPage.getRiverElement(this.selectedRiver!.id);
    await expect(pathEl).toHaveAttribute('data-editing', 'true');
});

Then('the hex is added to the river', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    const key = hexKey(this.lastClickedHex!.q, this.lastClickedHex!.r);
    expect(river!.nodes.has(key)).toBe(true);
});

Then('an edge is added between the two clicked hexes', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    expect(this.previouslyClickedHex).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    expect(river!.hasEdge(this.previouslyClickedHex!, this.lastClickedHex!)).toBe(true);
});

Then('no edge is added', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    // `selectedRiver` was read before the hex was clicked, so its edges are the
    // baseline the click must not have changed.
    expect(river!.edges.length).toBe(this.selectedRiver!.edges.length);
});
