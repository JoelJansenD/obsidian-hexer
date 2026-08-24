import { Faction } from "../../../src/logic/faction";
import { buildHexerFileContent, SEEDED_FACTIONS, SeedFaction } from "./fixture";
import { enterEditMode } from "./editMode";

class FactionPage {
    async createFaction() {
        await this.selectAndClick('[data-role="add-faction"]');
    }

    /**
     * Writes the standard factions into the open Hexer view, rebuilding the
     * editor through the real parse path (the first faction is painted onto the
     * first few hexes). Returns the seeded factions. The editor is rebuilt with
     * default state, so callers must re-select the layer and tool afterwards.
     */
    async seedFactions(): Promise<SeedFaction[]> {
        const content = buildHexerFileContent([], SEEDED_FACTIONS);
        await browser.executeObsidian(({ app }, data) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                setViewData?: (data: string, clear: boolean) => void;
            } | undefined;
            view?.setViewData?.(data, true);
        }, content);
        return SEEDED_FACTIONS;
    }

    /**
     * Puts a faction row into edit mode, which also makes it the active faction.
     * The edit control only exists while the row is in view mode.
     */
    async editFaction(id: string) {
        await enterEditMode(id);
    }

    /**
     * Opens the settings dialog for a faction. The gear only exists while the row
     * is in edit mode, so the row must already be active when this is called.
     */
    async openFactionSettings(id: string) {
        await this.selectAndClick(`[data-item-id="${id}"] [data-role="item-settings"]`);
    }

    public async getFactionElement(id: string) {
        return browser.$(`[data-item-id="${id}"]`);
    }

    async getFaction(id: string): Promise<Faction | undefined> {
        const factions = await this.getFactions();
        return factions.find(faction => faction.id === id);
    }

    async getFactions(): Promise<Faction[]> {
        const factions = await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: {
                    factions?: Array<{
                        id: string;
                        name: string;
                        color?: string;
                        filePath?: string | null;
                    }>;
                };
            } | undefined;
            return (view?.hexerData?.factions ?? []).map((faction) => ({
                id: faction.id,
                name: faction.name,
                color: faction.color!,
                filePath: faction.filePath ?? null,
            }));
        });
        console.debug(`[hexer-e2e] getFactions`, JSON.stringify(factions));
        return factions;
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        // Wait for clickability, not mere existence: in headless CI the element can
        // be in the DOM but not yet interactable, so a bare waitForExist lets the
        // click race with render and silently no-op.
        await element.waitForClickable();
        await element.click();
    }
}

export default new FactionPage();
