import { Path, PathEdge, PathNode } from "../../../src/logic/path";
import { FRONTMATTER_REGEX, serializePath } from "../../../src/obsidian/frontmatter";

class PathPage {
    async createRiver() {
        await this.selectAndClick('[data-role="add-river"]');
    }

    // Seeds a river straight into the view's data and reloads it through the
    // view's own parser, so the river exists as a proper Path and is rendered
    // without entering edit mode (unlike creating one through the add button).
    //
    // The river is built and serialized with the plugin's own Path/serializePath
    // helpers, and the frontmatter block is located with the plugin's own
    // FRONTMATTER_REGEX, so this seed stays in step with the real parser and the
    // SerializedPath shape rather than duplicating them.
    async seedRiver(name: string): Promise<string> {
        const river = new Path(name);
        await browser.executeObsidian(({ obsidian, app }, args) => {
            const { frontmatterRegexSource, serializedRiver } = args;
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                getViewData: () => string;
                setViewData: (data: string, clear: boolean) => void;
            };

            const data = view.getViewData();
            const match = new RegExp(frontmatterRegexSource).exec(data);
            if (!match) {
                throw new Error('Hexer view has no frontmatter to seed a river into');
            }

            const frontmatter = obsidian.parseYaml(match[1]) as {
                hexer: { rivers?: unknown[] };
            };
            frontmatter.hexer.rivers = [
                ...(frontmatter.hexer.rivers ?? []),
                serializedRiver,
            ];

            const body = data.slice(match[0].length);
            view.setViewData(`---\n${obsidian.stringifyYaml(frontmatter).trim()}\n---${body}`, true);
        }, {
            frontmatterRegexSource: FRONTMATTER_REGEX.source,
            serializedRiver: serializePath(river),
        });
        return river.id;
    }

    async editRiver(id: string) {
        await this.selectAndClick(`[data-path-id="${id}"] [data-role="edit-path"]`);
    }

    public async getRiverElement(id: string) {
        return browser.$(`[data-path-id="${id}"]`);
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
