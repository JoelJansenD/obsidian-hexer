---
Status: accepted
---

# Printing is a rasterised whole-map render through the OS dialog

Printing a map ([#82](https://github.com/JoelJansenD/obsidian-hexer/issues/82)) reuses the existing immediate-mode Canvas 2D renderer ([ADR-0009](./0009-immediate-mode-rendering.md)): `render` runs against an offscreen canvas sized to a tight crop of the map's geometry, and the resulting raster is printed as the sole content of the page. That dialog's *Save as PDF* covers the "export to PDF" need, so we ship **no** PDF or SVG library and add **no** vector render path.

Only the map image reaches the paper: the raster is placed as the sole content of a hidden `<iframe>` — a white, no-chrome, fit-to-page document — whose own window is then printed, never the Obsidian window. The frame's document is built by DOM manipulation of its existing `about:blank` document, never `document.write`: an Electron webview refuses to show a print preview for a written-into frame ("this app doesn't support print preview") but prints a DOM-built one fine.

## Considered options

- **OS-dialog raster (chosen)** — zero dependencies, one code path, reuses `render` as-is, and gets PDF for free via the print driver. The cost is that output is a bitmap: no selectable text, and resolution is bounded by the supersample factor and the browser's max canvas dimensions.
- **Bundle a PDF library (e.g. jsPDF)** — a true PDF file without the OS dialog, but a real dependency and weight, and still rasterised unless the whole scene is redrawn in the library's vector API.
- **A second, SVG/vector render path** — infinite-resolution, text-selectable output, but a parallel renderer to build and keep in lockstep with the Canvas one. Rejected as far too costly for the value.

## Consequences

- Print output is a raster. Print quality is governed by a supersample factor (~3×) and hard-capped at a safe max canvas dimension, so very large maps are downscaled rather than crashing on browser canvas limits.
- "Export to PDF" is not a first-class file export; it is whatever the OS print driver produces. A dedicated PNG file export or a true vector PDF, if ever wanted, are separate future paths that this decision deliberately defers, not blocks.
- The print render is not a screenshot of the canvas: it always covers the whole map regardless of the camera, forces the crosshair (a pure cursor/origin guide) off, and lets coordinate labels and grid borders each follow their display toggle. See `CONTEXT.md` (`Print`).
