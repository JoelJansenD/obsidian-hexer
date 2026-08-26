---
Status: accepted (provisional)
---

# Rendering: immediate-mode Canvas 2D, full redraw

The map is drawn with the Canvas 2D API in immediate mode: every frame clears the canvas and repaints every pass — terrain fills, borders, factions, icons, paths, crosshair — in a fixed painter's-algorithm order. Icons are re-parsed from their SVG source on each draw.

This is chosen for simplicity and correctness at current map sizes, and is explicitly **provisional**: it does no caching, culling, or dirty-rect tracking, and will be optimized when it becomes a bottleneck.

## Consequences

The known optimization direction — cache parsed SVG into `Path2D`, cache static layers to an offscreen canvas, and add viewport culling / dirty rectangles — is tracked in [#63](https://github.com/JoelJansenD/obsidian-hexer/issues/63). Viewport culling also depends on a future spatial index over `hexes`, which today is scanned in full.
