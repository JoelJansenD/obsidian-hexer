# Address hexes with axial (q, r) coordinates

Hexes are addressed by axial coordinates `(q, r)` and converted to and from pixel points with the standard cube-rounding algorithm. Axial keeps storage compact (two numbers, one `"q,r"` key per hex) while cube-rounding gives exact point-to-hex hit-testing.

The map owns the `size` and `orientation` (flat-top / pointy-top) that turn a coordinate into a point. Every conversion routes through `hexToPoint` / `pointToAxialCoordinates` on the map, so a caller can never restate the orientation and accidentally lay a pointy-top map out as flat-top.

## Considered options

Offset and doubled coordinates were rejected: they complicate neighbour and distance maths that axial + cube handle cleanly. (The type was previously misnamed `RadialCoordinates`; it is now `AxialCoordinates`.)
