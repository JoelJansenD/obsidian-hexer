import { mapToScreen } from "../../../src/logic/camera";
import { AxialCoordinates, Point, axialCoordinatesToPoint } from "../../../src/logic/hexagon";
import { buildHexerFileContent, SEEDED_RIVER_ID } from "./fixture";
import editorPage from "./editor.page";

interface CameraState {
    offset: Point;
    zoom: number;
}

class CameraPage {
    /** The live camera (map-space centre offset + zoom). */
    async getCamera(): Promise<CameraState> {
        const { camera } = await this.readCameraAndSize();
        return camera;
    }

    /** Whether an undo step is available — false right after a fresh load. */
    async canUndo(): Promise<boolean> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { history?: { canUndo?: boolean } } | undefined;
            return view?.history?.canUndo ?? false;
        });
    }

    /**
     * Wraps the view's requestSave so a later {@link wasSaveRequested} can tell
     * whether a gesture asked the host to persist — i.e. marked the document
     * dirty. Install after any seeding but before the gesture under test.
     */
    async spyOnSaveRequests(): Promise<void> {
        await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                requestSave: () => void;
                __saveRequested?: boolean;
                __saveSpied?: boolean;
            } | undefined;
            if (!view) {
                return;
            }
            view.__saveRequested = false;
            if (!view.__saveSpied) {
                const original = view.requestSave.bind(view);
                view.requestSave = () => { view.__saveRequested = true; return original(); };
                view.__saveSpied = true;
            }
        });
    }

    async wasSaveRequested(): Promise<boolean> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { __saveRequested?: boolean } | undefined;
            return view?.__saveRequested ?? false;
        });
    }

    /**
     * Reseeds the open view with content spread across a wide area — the standard
     * hexes near the origin plus a river whose nodes reach far out — so it starts
     * partly off-screen at the default camera. A fresh load, so no undo history.
     */
    async seedWideContent(): Promise<void> {
        const content = buildHexerFileContent([
            { id: SEEDED_RIVER_ID, name: 'Seeded river', nodes: [{ q: -6, r: 4 }, { q: 7, r: -3 }, { q: 9, r: 6 }] },
        ]);
        await browser.executeObsidian(({ app }, data) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as { setViewData?: (data: string, clear: boolean) => void } | undefined;
            view?.setViewData?.(data, true);
        }, content);
    }

    /**
     * Drags with the middle mouse button from the canvas centre by a pixel delta.
     * Dispatches the DOM events on the view's real canvas: WebdriverIO's native
     * middle-button input is not delivered reliably in the Obsidian/Electron
     * harness, but the app's own listeners, camera commit, and save path run on
     * the dispatched events.
     */
    async middleDrag(dx: number, dy: number): Promise<void> {
        await browser.executeObsidian(({ app }, deltaX, deltaY) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
            if (!canvas) {
                return;
            }
            const rect = canvas.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            const mouse = (type: string, x: number, y: number, init: MouseEventInit) =>
                new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, ...init });
            // Middle button = 1; buttons bitmask for middle held = 4.
            canvas.dispatchEvent(mouse('mousedown', startX, startY, { button: 1, buttons: 4 }));
            canvas.dispatchEvent(mouse('mousemove', startX + deltaX, startY + deltaY, { buttons: 4 }));
            // The pan ends on a window-level mouseup, wherever the release lands.
            window.dispatchEvent(mouse('mouseup', startX + deltaX, startY + deltaY, { button: 1 }));
        }, dx, dy);
        console.debug('[hexer-e2e] middleDrag', JSON.stringify({ dx, dy }));
    }

    /**
     * Scrolls the wheel over a hex's centre. A negative delta scrolls up (zooms
     * in). Dispatched on the view's real canvas for the same reason as
     * {@link middleDrag}.
     */
    async wheelOverHex(hex: AxialCoordinates, deltaY: number): Promise<void> {
        const offset = await this.hexScreenOffset(hex);
        await browser.executeObsidian(({ app }, offsetX, offsetY, delta) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const canvas = leaf?.view?.containerEl?.querySelector('.hexer-canvas') as HTMLCanvasElement | null;
            if (!canvas) {
                return;
            }
            const rect = canvas.getBoundingClientRect();
            canvas.dispatchEvent(new WheelEvent('wheel', {
                deltaY: delta,
                clientX: rect.left + rect.width / 2 + offsetX,
                clientY: rect.top + rect.height / 2 + offsetY,
                bubbles: true,
                cancelable: true,
            }));
        }, offset.x, offset.y, deltaY);
        console.debug('[hexer-e2e] wheelOverHex', JSON.stringify({ hex, deltaY, offset }));
    }

    /** Clicks the zoom-to-fit button on the action bar. */
    async clickZoomToFit(): Promise<void> {
        const button = browser.$('[aria-label="Zoom to fit"]');
        await button.waitForClickable();
        await button.click();
        console.debug('[hexer-e2e] clickZoomToFit');
    }

    /**
     * A hex's centre as a pixel offset from the canvas centre, under the live
     * camera: `zoom * (mapPoint - offset)`. This is where the renderer draws it,
     * and the origin WebdriverIO pointer/wheel offsets use.
     */
    async hexScreenOffset(hex: AxialCoordinates): Promise<Point> {
        const { camera, size } = await this.readCameraAndSize();
        return this.toScreenOffset(hex, camera, size);
    }

    /** Every hex and path node as a pixel offset from the canvas centre. */
    async allContentScreenOffsets(): Promise<Point[]> {
        const { camera, size } = await this.readCameraAndSize();
        const content = await browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: {
                    hexes?: Record<string, { q: number; r: number }>;
                    rivers?: Array<{ nodes?: Record<string, { q: number; r: number }> }>;
                    roads?: Array<{ nodes?: Record<string, { q: number; r: number }> }>;
                };
            } | undefined;
            const data = view?.hexerData;
            const nodesOf = (paths: Array<{ nodes?: Record<string, { q: number; r: number }> }> = []) =>
                paths.flatMap(path => Object.values(path.nodes ?? {}).map(node => ({ q: node.q, r: node.r })));
            return [
                ...Object.values(data?.hexes ?? {}).map(hex => ({ q: hex.q, r: hex.r })),
                ...nodesOf(data?.rivers),
                ...nodesOf(data?.roads),
            ];
        });
        return content.map(coordinate => this.toScreenOffset(coordinate, camera, size));
    }

    /** The canvas display size in CSS pixels. */
    async canvasSize(): Promise<{ width: number; height: number }> {
        return editorPage.canvas.getSize();
    }

    private toScreenOffset(coordinate: AxialCoordinates, camera: CameraState, size: number): Point {
        // The e2e fixtures use flat-top maps, so name that orientation explicitly.
        const point = axialCoordinatesToPoint(coordinate, size, 'flat-top');
        // Centre-relative screen offset: mapToScreen over a zero-sized viewport
        // drops the viewport-centre term, leaving zoom * (point - offset). Reusing
        // the renderer's own transform keeps hit positions in step with the model.
        return mapToScreen(camera, { width: 0, height: 0 }, point);
    }

    /** The one-hex fit padding in screen pixels at the current zoom. */
    async fitPaddingScreenPx(): Promise<number> {
        const { camera, size } = await this.readCameraAndSize();
        return size * camera.zoom;
    }

    private async readCameraAndSize(): Promise<{ camera: CameraState; size: number }> {
        return browser.executeObsidian(({ app }) => {
            const leaf = app.workspace.getLeavesOfType('hexer-view')[0];
            const view = leaf?.view as unknown as {
                hexerData?: { camera?: { offset?: { x: number; y: number }; zoom?: number }; size?: number };
            } | undefined;
            const data = view?.hexerData;
            return {
                camera: {
                    offset: data?.camera?.offset ?? { x: 0, y: 0 },
                    zoom: data?.camera?.zoom ?? 1,
                },
                size: data?.size ?? 50,
            };
        });
    }
}

export default new CameraPage();
