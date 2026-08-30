import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import { ViewMode } from '../../../src/logic/EditorState';
import modePage from '../support/mode.page';

When('I click the mode toggle on the action bar', async function () {
    await modePage.clickModeToggle();
});

Then('the editor is in {word} mode', async function (mode: ViewMode) {
    await modePage.waitForMode(mode);
    expect(await modePage.currentMode()).toBe(mode);
});

Then('the sidebar is visible', async function () {
    expect(await modePage.isSidebarVisible()).toBe(true);
});

Then('the sidebar is not visible', async function () {
    expect(await modePage.isSidebarVisible()).toBe(false);
});

Then('the paint-tool cluster is visible', async function () {
    expect(await modePage.isToolClusterVisible()).toBe(true);
});

Then('the paint-tool cluster is not visible', async function () {
    expect(await modePage.isToolClusterVisible()).toBe(false);
});

Then('the action bar is visible', async function () {
    expect(await modePage.isActionBarVisible()).toBe(true);
});
