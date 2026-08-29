import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import coordinatesPage from '../support/coordinates.page';
import { STANDARD_HEXES } from '../support/fixture';
import { CoordinatesContext } from '../support/contexts/coordinates.context';

// The q,r label every seeded, non-empty hex should show when labels are on.
const EXPECTED_LABELS = STANDARD_HEXES.map(hex => `${hex.q},${hex.r}`).sort();

Given('coordinate labels are enabled', async function () {
    await coordinatesPage.setDisplayCoordinates(true);
});

Given('coordinate labels are disabled', async function () {
    await coordinatesPage.setDisplayCoordinates(false);
});

When('the map is rendered', async function (this: CoordinatesContext) {
    this.drawnLabels = await coordinatesPage.renderAboveThreshold();
});

When('the map is zoomed out below the label threshold', async function (this: CoordinatesContext) {
    this.drawnLabels = await coordinatesPage.renderBelowThreshold();
});

When('the map is zoomed back in above the label threshold', async function (this: CoordinatesContext) {
    this.drawnLabels = await coordinatesPage.renderAboveThreshold();
});

Then('every non-empty hex shows its coordinate label', function (this: CoordinatesContext) {
    expect(this.drawnLabels).toEqual(EXPECTED_LABELS);
});

Then('no coordinate labels are drawn', function (this: CoordinatesContext) {
    expect(this.drawnLabels).toEqual([]);
});
