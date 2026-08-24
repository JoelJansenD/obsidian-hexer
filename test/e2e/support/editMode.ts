/**
 * Puts a sidebar list row (river, road, faction, ...) into edit mode and waits
 * until the row actually reports it via data-editing="true".
 *
 * A single click isn't reliable in headless CI: entering edit mode re-renders the
 * list, and the click can land while the list is still settling after a rebuild,
 * so it silently no-ops. Re-clicking the edit control until data-editing flips is
 * the only trustworthy signal that edit mode took, and it fails fast at its source
 * (rather than as a confusing downstream assertion) when it never engages.
 */
export async function enterEditMode(id: string): Promise<void> {
    await browser.waitUntil(async () => {
        const row = browser.$(`[data-item-id="${id}"]`);
        if (!(await row.isExisting())) {
            return false;
        }
        if ((await row.getAttribute('data-editing')) === 'true') {
            return true;
        }

        // In view mode the edit control is present; once edit mode engages it is
        // replaced by the save control, so this stops clicking on its own.
        const editButton = browser.$(`[data-item-id="${id}"] [data-role="edit-item"]`);
        if (await editButton.isClickable()) {
            await editButton.click();
        }
        return false;
    }, {
        timeout: 10000,
        interval: 250,
        timeoutMsg: `Row ${id} never entered edit mode`,
    });
}
