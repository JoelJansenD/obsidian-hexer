import { getAvailableTools, resolveToolStrategy } from "./ToolStrategy";
import BrushStrategy from "./BrushStrategy";
import BucketStrategy from "./BucketStrategy";
import EraserStrategy from "./EraserStrategy";
import PathPolygonStrategy from "./PathPolygonStrategy";
import { HexFieldLayer } from "../EditorState";

const hexFieldLayers: HexFieldLayer[] = ['terrain', 'icon', 'faction'];

describe('resolveToolStrategy', () => {
    it.each(hexFieldLayers)('resolves brush, bucket and eraser for the %s layer', (layer) => {
        expect(resolveToolStrategy(layer, 'brush')).toBeInstanceOf(BrushStrategy);
        expect(resolveToolStrategy(layer, 'bucket')).toBeInstanceOf(BucketStrategy);
        expect(resolveToolStrategy(layer, 'eraser')).toBeInstanceOf(EraserStrategy);
    });

    it('binds the resolved strategy to the requested layer', () => {
        const strategy = resolveToolStrategy('faction', 'brush')!;
        expect(strategy.tool).toBe('brush');
        expect(strategy.layers).toEqual(['faction']);
    });

    it('resolves the polygon tool for river and road', () => {
        expect(resolveToolStrategy('river', 'polygon')).toBeInstanceOf(PathPolygonStrategy);
        expect(resolveToolStrategy('road', 'polygon')).toBeInstanceOf(PathPolygonStrategy);
    });

    it('returns null for unsupported (layer, tool) pairings', () => {
        expect(resolveToolStrategy('terrain', 'polygon')).toBeNull();
        expect(resolveToolStrategy('river', 'brush')).toBeNull();
        expect(resolveToolStrategy('terrain', 'select')).toBeNull();
    });
});

describe('getAvailableTools', () => {
    it.each(hexFieldLayers)('offers brush, bucket and eraser on the %s layer', (layer) => {
        expect(getAvailableTools(layer).sort()).toEqual(['brush', 'bucket', 'eraser']);
    });

    it('offers only the polygon tool on path layers', () => {
        expect(getAvailableTools('river')).toEqual(['polygon']);
        expect(getAvailableTools('road')).toEqual(['polygon']);
    });
});
