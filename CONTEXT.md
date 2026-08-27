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

**Camera**:
How the map is currently framed in the viewport: a pan **offset** plus a **zoom** magnification. The offset is kept centre-relative so it survives resizes. The camera lives in the map and rides undo snapshots; a camera-only move persists to the file but records no undo step.
_Avoid_: Viewport, scroll, pan (as a noun)

**Zoom**:
The camera's view magnification: a scale factor applied on top of the pan when drawing and inverted when hit-testing (`1.0` is unscaled). Direct zoom is clamped to 0.2×–5×; zoom-to-fit may drop below 0.2× to frame an oversized map. Distinct from `size` — zoom scales the whole rendered scene, `size` is the map's intrinsic hex circumradius and is never repurposed for zoom.

**Zoom to fit**:
The camera-only move that frames every hex and every path node within the viewport with about one hex of padding, centred. On an empty map it resets the camera to its default (hex 0,0 centred, zoom 1.0).

**Action bar**:
The always-available horizontal bar across the top of the canvas area, holding global actions (currently only zoom-to-fit) independent of the active layer or tool. Distinct from the paint-tool cluster, which is layer/tool dependent.
_Avoid_: Toolbar, tool bar

**Tool**:
The active editing mode: select, brush, bucket, eraser, or polygon.

**Stroke**:
A single pointer gesture (press to release). All the edits it produces coalesce into one undo step.
_Avoid_: Gesture, drag
