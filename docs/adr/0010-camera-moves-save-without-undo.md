# Camera moves save but don't undo

The camera is plain data — the map point it is centred on (`offset`) plus a `zoom` magnification ([#41](https://github.com/JoelJansenD/obsidian-hexer/issues/41)); both live in `HexerData` and ride undo snapshots ([ADR-0005](./0005-snapshot-undo-redo.md)). A camera-only move commits through the single-writer `setData` seam ([ADR-0006](./0006-single-writer-data-flow.md)) with `commitHistory: false`: it adopts the new camera, re-serializes, and requests a save like any edit, but records **no** undo entry. Panning and zooming therefore persist to the note without becoming their own undo steps; the next real edit's snapshot captures wherever the camera sits, and undo/redo restores the camera that was live at that edit, moving the view back to the edit site.

## Consequences

- `setData` can persist **without** recording history. This is the one sanctioned exception to ADR-0006's "`setData` records the edit"; nothing else writes the map.
- A camera move marks the document dirty, since it saves like any other edit.

## Notes

- The camera is plain data; modifications apply to it directly. Render pans and zooms the canvas from the camera, and hit-testing inverts the same pan and zoom on the cursor — each at its own use site. A conversion helper only moves into `logic/camera.ts` once more than one caller needs it.
- Pan/zoom math is pure functions in `logic/camera.ts` (`panCamera`, `zoomCameraAt`, `fitCamera`), wrapped by a `CameraStrategy` that owns gesture state — mirroring the tool strategies ([ADR-0007](./0007-tool-strategy-system.md)). The view only binds DOM events to the strategy.
- **Open question, deferred to implementation:** how to stop the `Space` key and middle-mouse gesture from triggering Obsidian's own scroll/key handling.
