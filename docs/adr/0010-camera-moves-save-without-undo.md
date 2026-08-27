# Camera moves save but don't undo

Adding zoom ([#41](https://github.com/JoelJansenD/obsidian-hexer/issues/41)) makes the camera a pan `offset` plus a `zoom` magnification; both live in `HexerData` and ride undo snapshots as before ([ADR-0005](./0005-snapshot-undo-redo.md)). A camera-only move commits through the same single-writer `setData` seam ([ADR-0006](./0006-single-writer-data-flow.md)) but passes `commitHistory: false`: it adopts the new camera, re-serializes, and requests a save like any edit, yet records **no** undo entry. So panning and zooming persist to the note but never become their own undo steps; the next real edit's snapshot captures wherever the camera sits, and undo/redo restores the camera that was live at that edit, moving the view back to the edit site.

## Consequences

- `setData`'s contract widens: it can persist **without** recording history. This is the one sanctioned exception to ADR-0006's "`setData` records the edit"; nothing else writes the map.
- Because a camera move saves, it **does** mark the document dirty — a deliberate reversal of the "not dirty on pan" wording in the original #41 brief.

## Notes

- Render and hit-testing share a single `cameraTransform(camera, vw, vh)` exposing `toScreen`/`toMap` (pan and zoom composed once, the inverse derived), so they cannot disagree at any zoom. It replaces the offset-only `cameraViewOffset`.
- Pan/zoom math is pure functions in `logic/camera.ts` (`panCamera`, `zoomCameraAt`, `fitCamera`), wrapped by a `CameraStrategy` that owns gesture state — mirroring the tool strategies ([ADR-0007](./0007-tool-strategy-system.md)). The view only binds DOM events to the strategy.
- **Open question, deferred to implementation:** how to stop the `Space` key and middle-mouse gesture from triggering Obsidian's own scroll/key handling.
