# Store the map in the note's YAML frontmatter

A Hexer map lives entirely in the YAML frontmatter of a `.hexer.md` note, nested under a single `hexer:` key. Frontmatter is Obsidian's native metadata mechanism, so the map travels with an ordinary note (portable, linkable, versionable), and the `hexer:` namespace keeps it from colliding with other plugins' or the user's own frontmatter fields.

The on-disk shape is deliberately identical to the in-memory shape: `hexes` and path `nodes` are plain objects keyed by `"q,r"` strings rather than `Map`s. Parsing is then a near-identity operation — fast JSON-style record access and O(1) keyed lookup on update — with no shape-transform seam to maintain.

## Consequences

- The storage format is isolated behind `parseHexerDocument` / `serializeHexerDocument`. If frontmatter ever proves limiting, YAML can be swapped for a fenced JSON block behind that seam — the low-cost fallback.
- There is no validation on load: a hand-edited or malformed `hexer` block parses straight into the model. User-facing validation is tracked in [#60](https://github.com/JoelJansenD/obsidian-hexer/issues/60).
- Schema migration across `version` values is deferred until after the first production release; the `version` field is written but not yet read.
