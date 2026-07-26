import { Path, PathEdge, PathNode } from "../../../src/logic/path";

class PathPage {
    async createRiver() {
        await this.selectAndClick('[data-role="add-river"]');
    }

    async getRivers(): Promise<Path[]> {
        return this.getPaths();
    }

    private async getPaths(): Promise<Path[]> {
        // A path's nodes are held in a Map, which cannot cross the Obsidian
        // bridge, so send plain objects and rebuild the Path on this side.
        const paths = await browser.executeObsidian(({ app }, key) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: Record<string, Array<{
                    id: string;
                    name: string;
                    nodes?: Map<string, PathNode>;
                    edges?: PathEdge[];
                }>>;
            } | undefined;
            return (view?.hexerData?.[key] ?? []).map((path) => ({
                id: path.id,
                name: path.name,
                nodes: path.nodes ? Object.fromEntries(path.nodes) : {},
                edges: path.edges ?? [],
            }));
        }, 'rivers');
        console.debug(`[hexer-e2e] getPaths (rivers)`, JSON.stringify(paths));
        return paths.map((path) => new Path({
            id: path.id,
            name: path.name,
            nodes: new Map(Object.entries(path.nodes)),
            edges: path.edges,
        }));
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        await element.waitForExist();
        await element.click();
    }
}

export default new PathPage();
