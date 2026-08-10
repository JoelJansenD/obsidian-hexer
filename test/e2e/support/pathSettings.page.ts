/**
 * Drives the path settings modal (PathSettingsModal). The modal renders into
 * Obsidian's modal container, so its fields are targeted by the data attributes
 * the modal sets on them rather than by row-scoped selectors.
 */
class PathSettingsPage {
    async setName(name: string) {
        const input = browser.$('[data-hexer-setting="path-name"]');
        await input.waitForExist();
        await input.setValue(name);
    }

    /**
     * Types the note name into the file search and picks the matching suggestion,
     * which is what actually links the note to the path.
     */
    async attachNote(noteName: string) {
        const search = browser.$('[data-hexer-setting="path-file"]');
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
        const button = browser.$('[data-role="save-path-settings"]');
        await button.waitForExist();
        await button.click();
    }
}

export default new PathSettingsPage();
