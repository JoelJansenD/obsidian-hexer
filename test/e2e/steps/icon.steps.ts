import { Given, Then, When } from "@wdio/cucumber-framework";
import { TestContext } from "../support/TestContext";
import { getHex } from "../support/editor.page";

Given('I have selected the {word} icon', async function (icon: string) {
    return 'pending';
});

When('I click a hex with an icon', async function (this: TestContext) {
    return 'pending';
});

Then('the hex will have a {word} icon', async function (this: TestContext, icon: string) {
    const hex = await getHex(this.lastClickedHex!);
    return 'pending';
});

Then('every hovered hex will have a castle icon', async function (this: TestContext) {
    return 'pending';
});