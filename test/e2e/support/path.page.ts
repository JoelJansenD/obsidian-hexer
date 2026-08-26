import { RadialCoordinates } from "../../../src/logic/hexagon";
import { Path, PathEdge, PathNode } from "../../../src/logic/path";
import { buildHexerFileContent, SEEDED_RIVER_ID } from "./fixture";
import { enterEditMode } from "./editMode";

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
    async seedRiver(nodes: RadialCoordinates[]): Promise<string> {
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
    async getActiveNode(): Promise<RadialCoordinates | null> {
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
        await enterEditMode(id);
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
        // A path's nodes are a plain keyed object, so they cross the Obsidian
        // bridge as-is; normalise the optional fields to their defaults.
        const paths = await browser.executeObsidian(({ app }, key) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: Record<string, Array<{
                    id: string;
                    name: string;
                    nodes?: Record<string, PathNode>;
                    edges?: PathEdge[];
                    filePath?: string | null;
                    color?: string;
                }>>;
            } | undefined;
            return (view?.hexerData?.[key] ?? []).map((path) => ({
                id: path.id,
                name: path.name,
                nodes: path.nodes ?? {},
                edges: path.edges ?? [],
                filePath: path.filePath ?? null,
                color: path.color || '#ff0000',
            }));
        }, 'rivers');
        console.debug(`[hexer-e2e] getPaths (rivers)`, JSON.stringify(paths));
        return paths;
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

export default new PathPage();
