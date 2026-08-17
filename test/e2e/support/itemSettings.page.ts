/**
 * Drives the item settings modal (ItemSettingsModal), shared by every sidebar
 * item type. The modal renders into Obsidian's modal container, so its fields
 * are targeted by the data attributes the modal sets on them rather than by
 * row-scoped selectors.
 */
class ItemSettingsPage {
    async setName(name: string) {
        const input = browser.$('[data-hexer-setting="item-name"]');
        await input.waitForExist();
        await input.setValue(name);
    }

    /**
     * Types the note name into the file search and picks the matching suggestion,
     * which is what actually links the note to the item.
     */
    async attachNote(noteName: string) {
        const search = browser.$('[data-hexer-setting="item-file"]');
        await search.waitForExist();
        await search.click();
        await search.setValue(noteName);

        await browser.$('.suggestion-item').waitForExist();
        const items = await browser.$$('.suggestion-item');
        for (const item of items) {
            const text = await item.getText();
            if (text.includes(noteName)) {
                await item.click();
                return;
            }
        }
        throw new Error(`No file suggestion matching "${noteName}"`);
    }

    async save() {
        const button = browser.$('[data-role="save-item-settings"]');
        await button.waitForExist();
        await button.click();
    }
}

export default new ItemSettingsPage();
