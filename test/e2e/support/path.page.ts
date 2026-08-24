import { AxialCoordinates } from "../../../src/logic/hexagon";
import { Path, PathEdge, PathNode } from "../../../src/logic/path";
import { buildHexerFileContent, SEEDED_RIVER_ID } from "./fixture";

class PathPage {
    async createRiver() {
        await this.selectAndClick('[data-role="add-river"]');
    }

    /**
     * Writes a river with the given nodes (and edges between consecutive nodes)
     * into the open Hexer view, rebuilding the editor through the real parse
     * path. Returns the river's id. The editor is rebuilt with default state, so
     * callers must re-select the layer and tool afterwards.
     */
    async seedRiver(nodes: AxialCoordinates[]): Promise<string> {
        const content = buildHexerFileContent([
            { id: SEEDED_RIVER_ID, name: 'Seeded river', nodes },
        ]);
        await browser.executeObsidian(({ app }, data) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                setViewData?: (data: string, clear: boolean) => void;
            } | undefined;
            view?.setViewData?.(data, true);
        }, content);
        return SEEDED_RIVER_ID;
    }

    /**
     * The node currently selected in the active path, or null when none is.
     * The editor and its state are private, so reach through the view the same
     * way getPaths reaches hexerData.
     */
    async getActiveNode(): Promise<AxialCoordinates | null> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                editor?: {
                    _editorState?: {
                        activePath?: { activeNode?: { q: number; r: number } | null } | null;
                    };
                };
            } | undefined;
            const activeNode = view?.editor?._editorState?.activePath?.activeNode;
            return activeNode ? { q: activeNode.q, r: activeNode.r } : null;
        });
    }

    async editRiver(id: string) {
        await this.selectAndClick(`[data-item-id="${id}"] [data-role="edit-item"]`);
    }

    /**
     * Opens the settings dialog for a river: the settings gear only exists while
     * the row is in edit mode, so enter edit mode first, then click it.
     */
    async editRiverInformation(id: string) {
        await this.editRiver(id);
        await this.selectAndClick(`[data-item-id="${id}"] [data-role="item-settings"]`);
    }

    public async getRiverElement(id: string) {
        return browser.$(`[data-item-id="${id}"]`);
    }

    async getRiver(id: string): Promise<Path | undefined> {
        const rivers = await this.getRivers();
        return rivers.find(river => river.id === id);
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
                    filePath?: string | null;
                    color?: string;
                }>>;
            } | undefined;
            return (view?.hexerData?.[key] ?? []).map((path) => ({
                id: path.id,
                name: path.name,
                nodes: path.nodes ? Object.fromEntries(path.nodes) : {},
                edges: path.edges ?? [],
                filePath: path.filePath ?? null,
                color: path.color || '#ff0000',
            }));
        }, 'rivers');
        console.debug(`[hexer-e2e] getPaths (rivers)`, JSON.stringify(paths));
        return paths.map((path) => new Path({
            id: path.id,
            name: path.name,
            nodes: new Map(Object.entries(path.nodes)),
            edges: path.edges,
            filePath: path.filePath,
            color: path.color,
        }));
    }

    private async selectAndClick(selector: string) {
        const element = browser.$(selector);
        await element.waitForExist();
        await element.click();
    }
}

export default new PathPage();
