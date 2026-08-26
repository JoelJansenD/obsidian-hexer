# Model domain data as interfaces + free functions, not classes

Domain data (`HexerData`, `Hexagon`, `Path`, `Faction`, …) are plain TypeScript interfaces manipulated by free functions, not classes with methods. Because the data carry no behaviour, they are directly serializable — the in-memory value *is* the on-disk value, with nothing to strip or rehydrate at the persistence boundary (see [ADR 0001](./0001-map-stored-in-frontmatter.md)).

Classes are reserved for stateful or polymorphic collaborators — tool strategies, `EditHistory`, and the view components — where identity and behaviour matter.

## Considered options

The previous design used model classes with methods (replaced in [#59](https://github.com/JoelJansenD/obsidian-hexer/pull/59)). That coupled behaviour to data and forced a serialization seam to convert instances to and from plain frontmatter. The split above removes that seam.
