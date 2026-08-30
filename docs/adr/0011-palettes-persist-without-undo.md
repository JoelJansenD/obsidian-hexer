# Colour palettes persist per-map but stay outside undo

Each map carries two colour palettes — one for terrain, one for icons — of ten quick-switch colours seeded from constants and overridable in place ([#71](https://github.com/JoelJansenD/obsidian-hexer/issues/71), [CONTEXT.md](../../CONTEXT.md#colour)). They are plain data in `HexerData`, so overriding a swatch commits through the single-writer `setData` seam ([ADR-0006](./0006-single-writer-data-flow.md)) with `commitHistory: false`: it adopts the new palette, re-serializes, and requests a save, but records **no** undo entry. This is the same sanctioned save-without-history path the camera uses ([ADR-0010](./0010-camera-moves-save-without-undo.md)). A swatch is overridden by right-clicking it, which copies the layer's current active colour into the swatch; left-clicking instead quick-switches the active colour to the swatch's colour and is pure UI state (never persisted).

Unlike the camera, palettes are also **excluded from undo snapshots** ([ADR-0005](./0005-snapshot-undo-redo.md)). The camera rides snapshots, so undo restores the camera that was live at an edit; palettes must not — a palette is tool configuration that happens to travel with the map, not map content whose history matters. Applying an undo or redo snapshot therefore preserves the *current* palettes and restores every other field, so undo/redo never resurrects an earlier palette.

## Consequences

- The snapshot restore path treats palettes as an exception: it carries the live palettes across a snapshot apply rather than adopting the snapshot's. Every other `HexerData` field is fully snapshotted; palettes are the sole carve-out.
- A swatch override marks the document dirty and saves, like a camera-only move.
- New maps seed both palettes from the terrain and icon default constants in the file template; the defaults are constant arrays, cheap to change. Every map is assumed to carry both palettes.
