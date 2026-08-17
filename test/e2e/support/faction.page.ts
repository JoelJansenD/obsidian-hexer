import { Faction } from "../../../src/logic/faction";

class FactionPage {
    async createFaction() {
        await this.selectAndClick('[data-role="add-faction"]');
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
        await element.waitForExist();
        await element.click();
    }
}

export default new FactionPage();
