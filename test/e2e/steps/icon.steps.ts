import { Given, Then, When } from "@wdio/cucumber-framework";
import { IconContext } from "../support/contexts/icon.context";
import editorPage from "../support/editor.page";
import iconPage from "../support/icon.page";
import { colorToHex } from "../support/colors";

Given('I have selected the {word} icon', async function (this: IconContext, icon: string) {
    await iconPage.selectIcon(icon);
    this.icon = this.icon ? { ...this.icon, name: icon } : { name: icon, color: colorToHex('black') };
});

Given('I have selected a {word} icon color', async function (this: IconContext, color: string) {
    const hex = colorToHex(color);
    await iconPage.setColor(hex);
    this.icon = this.icon ? { ...this.icon, color: hex } : { name: 'castle', color: hex };
});

When('I click a hex with an icon', async function (this: IconContext) {
    await editorPage.clickHex({ q: 2, r: 2 });
    this.lastClickedHex = { q: 2, r: 2 };
});

Then('the hex will have a {word} {word} icon', async function (this: IconContext, color: string, icon: string) {
    const hex = await editorPage.getHex(this.lastClickedHex!);
    expect(hex?.icon).not.toBeNull();
    expect(hex!.icon?.name).toBe(icon);
    expect(hex!.icon?.color).toBe(colorToHex(color));
});

Then('every hovered hex will have a {word} {word} icon', async function (this: IconContext, color: string, icon: string) {
    expect(this.lastDraggedHexes).not.toBeUndefined();
    this.lastDraggedHexes!.forEach(async (hex) => {
        const result = await editorPage.getHex(hex);
        expect(result?.icon).not.toBeNull();
        expect(result!.icon?.name).toBe(icon);
        expect(result!.icon?.color).toBe(colorToHex(color));
    });
});

Then('the icon will be erased', async function (this: IconContext) {
    expect(this.lastClickedHex).not.toBeNull();
    const result = await editorPage.getHex(this.lastClickedHex!);
    expect(result?.icon || null).toBeNull();
});

Then('every hovered icon will be erased', async function (this: IconContext) {
    expect(this.lastDraggedHexes).not.toBeUndefined();
    for (const hex of this.lastDraggedHexes || []) {
        const result = await editorPage.getHex(hex);
        expect(result?.icon || null).toBeNull();
    }
});

Then('every connected hex with the same icon will be replaced with the selected icon', async function (this: IconContext) {
    const connectedHexes = [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 2, r: 2 }, { q: 3, r: 1 }];
    for (const hex of connectedHexes) {
        const result = await editorPage.getHex(hex);
        expect(result?.icon?.name).toBe(this.icon?.name);
        expect(result?.icon?.color).toBe(this.icon?.color);
    }
});