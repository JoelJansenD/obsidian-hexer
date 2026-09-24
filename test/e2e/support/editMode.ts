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
    const editSelector = `[data-item-id="${id}"] [data-role="edit-item"]`;
    await browser.waitUntil(async () => {
        const row = browser.$(`[data-item-id="${id}"]`);
        if (!(await row.isExisting())) {
            return false;
        }
        if ((await row.getAttribute('data-editing')) === 'true') {
            return true;
        }

        // Dispatch the click in-page rather than as a geometric WebDriver click.
        // Entering edit mode expands the sidebar section, whose content animates
        // open (grid-template-rows 0fr->1fr under overflow:hidden); in headless CI
        // that animation can stay in flight — or stall — long enough that the edit
        // button is clipped by the section. A coordinate click then lands on the
        // .hexer-sidebar-section behind it ("element click intercepted"), and
        // isClickable() stays false so a gated click never even fires — the row
        // times out having "never entered edit mode". A dispatched DOM click fires
        // the row's handler regardless of layout; the data-editing check above
        // still gates on the real outcome, and the edit control is replaced by the
        // save control once edit mode engages, so the query no-ops from then on.
        await browser.execute((selector: string) => {
            (document.querySelector(selector) as HTMLElement | null)?.click();
        }, editSelector);
        return false;
    }, {
        timeout: 10000,
        interval: 250,
        timeoutMsg: `Row ${id} never entered edit mode`,
    });
}
