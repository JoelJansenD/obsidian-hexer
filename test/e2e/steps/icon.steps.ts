import { Given, Then, When } from "@wdio/cucumber-framework";
import { TestContext } from "../support/TestContext";
import { getHex, setIcon, setIconColour } from "../support/editor.page";
import { colourToHex } from "../support/colours";

Given('I have selected the {word} icon', async function (this: TestContext, icon: string) {
    await setIcon(icon);
    this.icon = this.icon ? { ...this.icon, name: icon } : { name: icon, color: colourToHex('black') };
});

Given('I have selected a {word} icon colour', async function (this: TestContext, colour: string) {
    const hex = colourToHex(colour);
    await setIconColour(hex);
    this.icon = this.icon ? { ...this.icon, color: hex } : { name: 'castle', color: hex };
});

When('I click a hex with an icon', async function (this: TestContext) {
    return 'pending';
});

Then('the hex will have a {word} {word} icon', async function (this: TestContext, colour: string, icon: string) {
    const hex = await getHex(this.lastClickedHex!);
    expect(hex?.icon).not.toBeNull();
    expect(hex!.icon?.name).toBe(icon);
    expect(hex!.icon?.color).toBe(colourToHex(colour));
});

Then('every hovered hex will have a castle icon', async function (this: TestContext) {
    return 'pending';
});