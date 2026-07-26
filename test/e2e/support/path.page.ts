export interface PathSummary {
    name: string;
    nodeCount: number;
    edgeCount: number;
}

class PathPage {
    async createRiver() {
        await this.selectAndClick('[data-role="add-river"]');
    }

    async getRivers(): Promise<PathSummary[]> {
        return this.getPaths();
    }

    // A path's nodes are held in a Map, which cannot cross the Obsidian bridge,
    // so summarise each path down to serialisable primitives.
    private async getPaths(): Promise<PathSummary[]> {
        const paths = await browser.executeObsidian(({ app }, key) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: Record<string, Array<{
                    name: string;
                    nodes?: Map<string, unknown>;
                    edges?: unknown[];
                }>>;
            } | undefined;
            return (view?.hexerData?.[key] ?? []).map((path) => ({
                name: path.name,
                nodeCount: path.nodes ? path.nodes.size : 0,
                edgeCount: path.edges ? path.edges.length : 0,
            }));
        }, 'rivers');
        console.debug(`[hexer-e2e] getPaths (rivers)`, JSON.stringify(paths));
        return paths;
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        await element.waitForExist();
        await element.click();
    }
}

export default new PathPage();
