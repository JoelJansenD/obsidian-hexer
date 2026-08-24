# Descriptor-driven tool strategies

Painting a hex-field layer (terrain, icon, faction) with a tool (brush, bucket, eraser) used to mean one class per (layer, tool) combination — nine near-identical strategies that had already drifted (the icon brush hand-rolled an empty hex while terrain and faction used `getOrCreateHex`). We collapsed them into three generic strategies (`BrushStrategy`, `BucketStrategy`, `EraserStrategy`), each parameterised by a `HexFieldLayerDescriptor` that captures the only real differences between layers: which field to read and write, where the paint value comes from in the editor state, and how two values compare for a bucket fill. Adding a hex-field layer is now one descriptor instead of three classes.

## Considered options

- **One class per (layer, tool)** — the status quo: nine files, heavy duplication, already drifting.
- **A base class per tool with thin subclasses** — removes some duplication but still one subclass per combination.
- **Three generic strategies over a per-layer descriptor table** — chosen.

## Consequences

- The per-layer differences live in one place (`hexFieldLayers.ts`); the strategies carry behaviour only.
- Bucket equality is per-descriptor (`equals`), so structured fields like `Icon` compare by value (name + colour) rather than reference.
- The descriptor's value type is erased to `any` at the registry boundary: the field sits in both read (covariant) and write (contravariant) positions, so the concrete descriptors are not mutually assignable to a shared type parameter. Each strategy re-fixes its own `T` when constructed.
- Rivers and roads keep their own `PathPolygonStrategy`; descriptors cover hex-field layers only.
