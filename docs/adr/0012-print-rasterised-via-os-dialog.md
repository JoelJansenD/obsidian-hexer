---
Status: accepted
---

# Printing is a rasterised whole-map render through the OS dialog

Printing a map ([#82](https://github.com/JoelJansenD/obsidian-hexer/issues/82)) reuses the existing immediate-mode Canvas 2D renderer ([ADR-0009](./0009-immediate-mode-rendering.md)): `render` runs against an offscreen canvas sized to a tight crop of the map's geometry, and the resulting raster is printed as the sole content of the page. That dialog's *Save as PDF* covers the "export to PDF" need, so we ship **no** PDF or SVG library and add **no** vector render path.

Only the map image reaches the paper, and it gets there through a dedicated, hidden Electron `BrowserWindow`, not `window.print` or the live app window. Two approaches were tried and abandoned on Obsidian's Electron: `window.print` (top window or a hidden `<iframe>`) routes through a print-preview shell Obsidian does not ship, failing outright — "this app doesn't support print preview"; and `webContents.print` on the *current* window comes back blank, because Obsidian's own styles suppress the injected print page. The working path renders the raster to a white PNG, writes a one-off HTML file that shows just that image, loads it into a hidden `BrowserWindow`, and invokes `webContents.print` on **that** — an isolated document Obsidian's CSS can't reach into. The Electron/Node calls live in the Obsidian layer (the view must not import Electron) via `@electron/remote`; the view hands over only the raster and orientation.

## Considered options

- **OS-dialog raster (chosen)** — zero dependencies, one code path, reuses `render` as-is, and gets PDF for free via the print driver. The cost is that output is a bitmap: no selectable text, and resolution is bounded by the supersample factor and the browser's max canvas dimensions.
- **Bundle a PDF library (e.g. jsPDF)** — a true PDF file without the OS dialog, but a real dependency and weight, and still rasterised unless the whole scene is redrawn in the library's vector API.
- **A second, SVG/vector render path** — infinite-resolution, text-selectable output, but a parallel renderer to build and keep in lockstep with the Canvas one. Rejected as far too costly for the value.

## Consequences

- Print output is a raster. Print quality is governed by a supersample factor (~3×) and hard-capped at a safe max canvas dimension, so very large maps are downscaled rather than crashing on browser canvas limits.
- "Export to PDF" is not a first-class file export; it is whatever the OS print driver produces. A dedicated PNG file export or a true vector PDF, if ever wanted, are separate future paths that this decision deliberately defers, not blocks.
- The print render is not a screenshot of the canvas: it always covers the whole map regardless of the camera, forces the crosshair (a pure cursor/origin guide) off, and lets coordinate labels and grid borders each follow their display toggle. See `CONTEXT.md` (`Print`).
- Printing needs the Electron desktop app: it opens a hidden `BrowserWindow` via `@electron/remote` and writes a temp HTML file to the OS temp dir (cleaned up afterwards). On mobile the action reports that printing is desktop-only rather than doing nothing. There is deliberately no in-app print preview — Obsidian's Electron can't render the native one, and Q8 keeps the flow straight-to-dialog.
