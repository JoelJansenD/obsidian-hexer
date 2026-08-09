import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import editorPage from '../support/editor.page';
import pathPage from '../support/path.page';
import { RiversAndRoadsContext } from '../support/contexts/rivers-and-roads.context';
import { RadialCoordinates } from '../../../src/logic/hexagon';
import { hexKey } from '../../../src/logic/HexerData';

// The data table shape for a river's nodes: a row per node with q and r columns.
interface NodeTable {
    hashes(): Array<{ q: string; r: string }>;
}

function nodesFromTable(table: NodeTable): RadialCoordinates[] {
    return table.hashes().map(row => ({ q: Number(row.q), r: Number(row.r) }));
}

// Seeds the river, then re-selects the river layer and polygon tool: seeding
// rebuilds the editor with default state, so the selections from the background
// have to be re-applied before hexes can be clicked.
async function seedRiverAndSelectTool(nodes: RadialCoordinates[]): Promise<string> {
    const id = await pathPage.seedRiver(nodes);
    await editorPage.selectLayer('river');
    await editorPage.selectPaintTool('polygon');
    return id;
}

When('I create a new river', async function (this: RiversAndRoadsContext) {
    await pathPage.createRiver();
    const rivers = await pathPage.getRivers();
    this.selectedRiver = rivers[0];
});

Given('I have a river with the following nodes:', async function (this: RiversAndRoadsContext, table: NodeTable) {
    const id = await seedRiverAndSelectTool(nodesFromTable(table));
    this.selectedRiver = await pathPage.getRiver(id);
    expect(this.selectedRiver).toBeDefined();
});

Given('I am editing a river with the following nodes:', async function (this: RiversAndRoadsContext, table: NodeTable) {
    const nodes = nodesFromTable(table);
    const id = await seedRiverAndSelectTool(nodes);
    await pathPage.editRiver(id);
    // Seeding from frontmatter leaves the app's active node null, a state a user
    // could never reach. Click the last node so the active node reflects a user
    // having drawn the nodes in order, leaving the final one selected.
    await editorPage.clickHex(nodes[nodes.length - 1]);
    this.selectedRiver = await pathPage.getRiver(id);
    expect(this.selectedRiver).toBeDefined();
});

When('I edit the river', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    await pathPage.editRiver(this.selectedRiver!.id);
});

When('I click on the hex at {int},{int}', async function (this: RiversAndRoadsContext, q: number, r: number) {
    const hex = { q, r };
    await editorPage.clickHex(hex);
    this.previouslyClickedHex = this.lastClickedHex;
    this.lastClickedHex = hex;
});

When('I double-click on the hex at {int},{int}', async function (this: RiversAndRoadsContext, q: number, r: number) {
    const hex = { q, r };
    await editorPage.doubleClickHex(hex);
    this.previouslyClickedHex = this.lastClickedHex;
    this.lastClickedHex = hex;
});

When('I right-click on the hex at {int},{int}', async function (this: RiversAndRoadsContext, q: number, r: number) {
    const hex = { q, r };
    await editorPage.rightClickHex(hex);
    this.previouslyClickedHex = this.lastClickedHex;
    this.lastClickedHex = hex;
});

Then('a new river is created', async function () {
    const rivers = await pathPage.getRivers();
    expect(rivers.length).toBe(1);
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

Then('an edge is added between the hexes at {int},{int} and {int},{int}', async function (this: RiversAndRoadsContext, aq: number, ar: number, bq: number, br: number) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    expect(river!.hasEdge({ q: aq, r: ar }, { q: bq, r: br })).toBe(true);
});

Then('the edge between the hexes at {int},{int} and {int},{int} is removed', async function (this: RiversAndRoadsContext, aq: number, ar: number, bq: number, br: number) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    expect(river!.hasEdge({ q: aq, r: ar }, { q: bq, r: br })).toBe(false);
});

Then('the hex is selected', async function (this: RiversAndRoadsContext) {
    expect(this.lastClickedHex).toBeDefined();
    const activeNode = await pathPage.getActiveNode();
    expect(activeNode).toEqual({ q: this.lastClickedHex!.q, r: this.lastClickedHex!.r });
});

Then('no edge is added', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    // `selectedRiver` was read before the hex was clicked, so its edges are the
    // baseline the click must not have changed.
    expect(river!.edges.length).toBe(this.selectedRiver!.edges.length);
});

Then('no hex is added to the river', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    // `selectedRiver` was read before the hex was clicked, so its nodes are the
    // baseline the click must not have changed.
    expect(river!.nodes.size).toBe(this.selectedRiver!.nodes.size);
});

Then('the hex is removed from the river', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    const key = hexKey(this.lastClickedHex!.q, this.lastClickedHex!.r);
    expect(river!.nodes.has(key)).toBe(false);
});

Then('all edges attached to the hex are removed', async function (this: RiversAndRoadsContext) {
    expect(this.selectedRiver).toBeDefined();
    expect(this.lastClickedHex).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    const key = hexKey(this.lastClickedHex!.q, this.lastClickedHex!.r);
    const attachedEdges = river!.edges.filter(edge => edge.from === key || edge.to === key);
    expect(attachedEdges.length).toBe(0);
});

Then('the following nodes are still present:', async function (this: RiversAndRoadsContext, table: NodeTable) {
    expect(this.selectedRiver).toBeDefined();
    const river = await pathPage.getRiver(this.selectedRiver!.id);
    expect(river).toBeDefined();
    for (const node of nodesFromTable(table)) {
        expect(river!.nodes.has(hexKey(node.q, node.r))).toBe(true);
    }
});
