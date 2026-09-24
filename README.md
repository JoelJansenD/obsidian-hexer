# Hexer

Draw and edit hex maps inside a note.

Hexer adds a canvas hex map editor to Obsidian. A whole map (its hexes, paths, factions and settings) lives in a single `.hexer.md` note, so it syncs, versions and links like everything else in the vault.

## What it does

- **Paint hexes.** Terrain colour, an icon, and a faction, each on its own toggleable layer, with select, brush, bucket, eraser and polygon tools.
- **Draw rivers and roads.** Paths are graphs of nodes and edges laid along the grid; rivers bend harder than roads.
- **Group hexes into factions.** A faction is a named, coloured region drawn as a translucent fill with an outer border.
- **Open a note per hex.** Double-clicking a hex opens the note for that coordinate, creating it from an optional template if it doesn't exist yet. Notes are located by a map-wide convention, so no hex has to be wired up by hand.
- **Print the whole map.** A clean, camera-independent render handed to the system print dialog, which doubles as Save as PDF.

Plus flat-top or pointy-top orientation, per-map colour palettes, coordinate labels, undo/redo, and a read-only View mode for when you just want to read the map.

## Installing

Hexer isn't in the community plugin directory yet. To try it, download `main.js`, `manifest.json` and `styles.css` from a [release](https://github.com/JoelJansenD/obsidian-hexer/releases) into `<vault>/.obsidian/plugins/hexer/`, then enable it under **Settings → Community plugins**.

## Development

```sh
npm install
npm run dev     # watch build into main.js / styles.css
npm test        # unit tests
npm run e2e     # end-to-end tests against a real Obsidian
```

Cutting a version is documented in [RELEASING.md](RELEASING.md). The vocabulary the code and docs use is fixed in [CONTEXT.md](CONTEXT.md), and the decisions behind the design are in [`docs/adr/`](docs/adr).

## License

[GPL-3.0](LICENSE). Third-party credits are in [CREDITS.md](CREDITS.md).

---

*This README is a placeholder: a proper explanation and usage guide are still to come.*
