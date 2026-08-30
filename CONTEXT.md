# Hexer

Hexer is an Obsidian plugin for editing hex maps. A map is stored inside a single `.hexer.md` note and edited through a canvas-based view. This glossary fixes the vocabulary the code and docs use for the map's parts and the act of editing them.

## Language

### Map & geometry

**Map**:
The whole hex map held in one `.hexer.md` note: its hexes, paths, factions, settings, and camera.
_Avoid_: Document, board, grid

**Hex**:
A single hexagonal cell at an axial coordinate, carrying its terrain, icon, and faction. Only non-empty hexes exist in the map. (The type is `Hexagon`.)
_Avoid_: Tile, cell

**Axial coordinate**:
A hex's address as a `(q, r)` pair. The map owns the orientation and size that turn a coordinate into a pixel point.
_Avoid_: Radial coordinate, offset coordinate, x/y

**Coordinate label**:
The `q,r` text drawn on a hex to show its axial coordinate. A single map-wide display toggle governs all of them at once (kin to the crosshair, not a per-hex property); labels sit on non-empty hexes only and hide when zoomed too small to read.

**Orientation**:
Whether hexes are flat-top or pointy-top. A single map-wide setting.

**Size**:
The hex circumradius in pixels; a single map-wide value that drives all layout.

### Layers & hex contents

**Layer**:
One of the map's toggleable visual bands: terrain, icon, river, road, faction. Terrain, icon, and faction are properties of a hex; river and road are map-level path layers.
_Avoid_: Level, band

**Terrain**:
A hex's fill colour.

**Icon**:
A symbol from the icon set, drawn centred on a hex, with its own colour.

**Faction**:
A named, coloured region. Hexes reference a faction by id; the region renders as a translucent fill with an outer border.
_Avoid_: Territory, region, nation

### Paths

**Path**:
A river or road: a graph of nodes joined by undirected edges. Rivers and roads share the same structure and differ only in how they render.
_Avoid_: Line, route

**Node**:
A path vertex sitting on a hex coordinate.
_Avoid_: Point, vertex

**Edge**:
An undirected connection between two nodes, drawn as a wavy line following the straight hex line between them.

**River / Road**:
The two kinds of path. Rivers bend harder than roads; otherwise identical.

### Editing

**Mode**:
Whether the editor is in **View** or **Edit**. View mode shows the map read-only — camera pan/zoom and the action bar only, with no sidebar and no paint-tool cluster, and no editing interactions on the canvas. Edit mode adds the full editing UI. A map always opens in View; the choice is session-only UI state and is never saved to the map or recorded in undo.
_Avoid_: Read/write, preview, source/reading

**Camera**:
How the map is currently framed in the viewport: the map point it is centred on (**offset**) plus a **zoom** magnification. Being a map point, the centre survives resizes. The camera lives in the map and rides undo snapshots; a camera-only move persists to the file but records no undo step.
_Avoid_: Viewport, scroll, pan (as a noun)

**Zoom**:
The camera's view magnification: a scale factor applied on top of the pan when drawing and inverted when hit-testing (`1.0` is unscaled). Direct zoom is clamped to 0.2×–5×; zoom-to-fit may drop below 0.2× to frame an oversized map. Distinct from `size` — zoom scales the whole rendered scene, `size` is the map's intrinsic hex circumradius and is never repurposed for zoom.

**Zoom to fit**:
The camera-only move that frames every hex and every path node within the viewport with about one hex of padding, centred. On an empty map it resets the camera to its default (hex 0,0 centred, zoom 1.0).

**Action bar**:
The always-available horizontal bar across the top of the canvas area, holding global actions (the mode toggle and zoom-to-fit) independent of the active layer or tool, and visible in both View and Edit mode. Distinct from the paint-tool cluster, which is layer/tool dependent and shows only in Edit mode.
_Avoid_: Toolbar, tool bar

**Tool**:
The active editing tool: select, brush, bucket, eraser, or polygon. Selectable only in Edit mode.

**Stroke**:
A single pointer gesture (press to release). All the edits it produces coalesce into one undo step.
_Avoid_: Gesture, drag

### Colour

**Active colour**:
The colour the next paint will use for a layer. Terrain and icon each have their own active colour; it is session-only UI state, not saved to the map. Set it with the layer's colour input or by clicking a palette swatch.

**Palette**:
A per-map set of ten quick-switch colours for one layer, laid out in two rows of five. Terrain and icon each own a separate palette. Every position always holds a colour: a palette begins seeded from fixed defaults and each colour can be overridden from then on — colours are never added or removed, only changed. A palette lives in the map and is saved with it, but its edits stand outside undo.
_Avoid_: Recents, swatch set

**Swatch**:
One of the ten colours in a palette, drawn as a coloured square. Left-clicking a swatch makes its colour the layer's active colour (quick-switch); right-clicking overrides the swatch with the current active colour.
_Avoid_: Slot (the position, not the colour), sample
