import { Mode } from "../../../src/logic/EditorState";

/**
 * Drives the top-level View/Edit mode: the action-bar toggle and the assertions
 * about which parts of the editor UI are on screen. Named distinctly from the
 * row-level `enterEditMode` rename helper in support/editMode.ts, which is a
 * different "edit mode" entirely.
 */
class ModePage {
    /** The action-bar button that switches between View and Edit. */
    private get toggle() {
        return browser.$('[data-hexer-action="toggle-mode"]');
    }

    /** The live editor mode, read off the editor root. */
    async currentMode(): Promise<Mode | null> {
        const value = await browser.$('.hexer-editor').getAttribute('data-hexer-mode');
        return value === 'view' || value === 'edit' ? value : null;
    }

    /** Clicks the action-bar mode toggle. */
    async clickModeToggle(): Promise<void> {
        await this.toggle.waitForClickable();
        await this.toggle.click();
    }

    /** Clicks the toggle and waits until the editor reports the target mode. */
    async switchTo(mode: Mode): Promise<void> {
        await this.clickModeToggle();
        await this.waitForMode(mode);
    }

    async waitForMode(mode: Mode): Promise<void> {
        await browser.waitUntil(async () => (await this.currentMode()) === mode, {
            timeoutMsg: `Editor never reached ${mode} mode`,
        });
    }

    async isSidebarVisible(): Promise<boolean> {
        return browser.$('.hexer-sidebar').isDisplayed();
    }

    async isToolClusterVisible(): Promise<boolean> {
        return browser.$('.hexer-tools').isDisplayed();
    }

    async isActionBarVisible(): Promise<boolean> {
        return browser.$('.hexer-action-bar').isDisplayed();
    }
}

export default new ModePage();
