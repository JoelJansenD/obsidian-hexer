# Hexes open notes by a map-wide convention, not a stored link

Factions and paths each store their linked note as a `filePath`, but hexes are a grid — far too numerous to author individually — so a hex has no stored note. Instead a map computes each hex's note path from a map-wide **note convention**: a template with `{{col}}`/`{{row}}` tokens (the hex's offset coordinate label), `.md` auto-appended, resolved from the vault root when it begins with `/` and relative to the map file otherwise, with `col`/`row` zero-padded to a minimum of two digits (sign preserved). Double-clicking a non-empty hex in View mode opens that note (Ctrl+double-click in a new tab), silently creating it first — seeded from an optional **note template** whose contents are copied and token-substituted — when it does not exist.

## Considered Options

- **Stored per-hex `filePath`** (as factions and paths use): rejected — authoring an explicit link across a whole grid of hexes is infeasible.
- **Coordinate-derived convention** (chosen): one map-wide rule links every hex with zero per-hex authoring.

## Consequences

- `col`/`row` are orientation-dependent (flat-top uses odd-q offset; pointy-top uses raw `q,r`), so changing `hexOrientation` remaps every hex's note path. Notes created under the old orientation are **not** migrated.
- The axial→offset transform (`labelCoordinates`) moves out of `render.ts` into the shared logic layer, since it now drives note paths as well as coordinate labels — a deliberate exception to keeping display-only transforms private to `render.ts`.
- No dependency on the core Templates plugin or Templater: template application is a self-contained content copy via `vault.create`. Third-party template processing (e.g. Templater) is out of scope for now.
- Only non-empty hexes are navigable; double-clicking a blank cell is a no-op, upholding the "only non-empty hexes exist" invariant.
