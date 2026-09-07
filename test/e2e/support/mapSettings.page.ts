import { HexOrientation } from '../../../src/logic/mapSettings';

/**
 * Drives the Map Settings modal (MapSettingsModal), opened from the sidebar's
 * configuration button in edit mode. Fields are targeted by the data attributes
 * the modal sets on them, the same way {@link ItemSettingsPage} works.
 */
class MapSettingsPage {
    /** Opens the modal from the sidebar and waits for its name field. */
    async open() {
        const button = browser.$('[data-hexer-role="configuration"]');
        await button.waitForClickable();
        await button.click();
        await browser.$('[data-hexer-setting="map-name"]').waitForExist();
    }

    async setName(name: string) {
        const input = browser.$('[data-hexer-setting="map-name"]');
        await input.waitForClickable();
        // clearValue then type, so an empty name is set by clearing alone (setValue
        // won't type nothing) and a non-empty one replaces rather than appends.
        await input.clearValue();
        if (name.length > 0) {
            await input.setValue(name);
        }
    }

    async setOrientation(orientation: HexOrientation) {
        const dropdown = browser.$('[data-hexer-setting="hex-orientation"]');
        await dropdown.waitForClickable();
        await dropdown.selectByAttribute('value', orientation);
    }

    async save() {
        const button = browser.$('[data-role="save-map-settings"]');
        await button.waitForClickable();
        await button.click();
    }

    /** The name validation message currently shown, empty when the name is valid. */
    async validationMessage(): Promise<string> {
        const message = browser.$('[data-hexer-role="map-name-validation"]');
        await message.waitForExist();
        return message.getText();
    }

    /** The map's persisted settings, as they stand on the open view's model. */
    private async settings(): Promise<{ name: string; hexOrientation: string }> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { mapSettings?: { name?: string; hexOrientation?: string } };
            } | undefined;
            const settings = view?.hexerData?.mapSettings;
            return {
                name: settings?.name ?? '',
                hexOrientation: settings?.hexOrientation ?? '',
            };
        });
    }

    async mapName(): Promise<string> {
        return (await this.settings()).name;
    }

    async hexOrientation(): Promise<string> {
        return (await this.settings()).hexOrientation;
    }
}

export default new MapSettingsPage();
