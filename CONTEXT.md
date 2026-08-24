# Hexer

Hexer is an Obsidian plugin for drawing hex-grid maps — terrain, icons, factions, rivers and roads — directly inside a note.

## Language

**Hex** (Hexagon):
A single cell of the map grid, addressed by axial coordinates `(q, r)`.

**Axial coordinates**:
The `(q, r)` address of a hex on the grid.
_Avoid_: radial coordinates, cube coordinates.

**Hex orientation**:
Whether hexes are drawn flat-top or pointy-top.

**Layer**:
A paintable dimension of the map. Every layer is either a hex-field layer or a path layer.

**Hex-field layer**:
A layer stored as one field of a hex — Terrain, Icon, or Faction. Painted with the brush, bucket, or eraser.

**Path layer**:
A layer stored as a standalone path graph — River or Road. Painted with the polygon tool.
_Avoid_: PathType.

**Terrain**:
The solid background colour of a hex.

**Faction**:
A named, coloured region claiming a set of hexes, drawn as a translucent overlay with a border around the claimed area.

**Icon**:
A named glyph, with a colour, placed on a hex.

**Path**:
An undirected graph of nodes and edges drawn as a flowing line — a River or a Road.
_Avoid_: line, route.

**Node**:
A hex that a path passes through.

**Edge**:
An undirected connection between two path nodes.

**Tool**:
The active editing action: Select, Brush, Bucket (flood fill), Eraser, or Polygon (path drawing).

**Editor state**:
The current editing selection — active layer, tool, colour, icon, faction, and in-progress path. Distinct from the map data: it is what the user is editing *with*, not the map itself.

**Camera**:
The viewport's pan offset over the map.

**Crosshair**:
The origin guide drawn at hex `(0, 0)`.

**Map settings**:
The map-wide options: its name, hex orientation, and whether hex borders and the crosshair are shown.
