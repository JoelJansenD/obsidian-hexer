import { applyNoteTemplate, resolveHexNotePath } from "./hexNote";

describe('resolveHexNotePath', () => {
    const tokens = { col: 3, row: 5 };

    it('returns null when the convention is empty or whitespace', () => {
        expect(resolveHexNotePath('', tokens, 'maps/World.hexer.md')).toBeNull();
        expect(resolveHexNotePath('   ', tokens, 'maps/World.hexer.md')).toBeNull();
    });

    it('substitutes zero-padded tokens, appends .md, and resolves relative to the map folder', () => {
        expect(resolveHexNotePath('notes/{{col}}-{{row}}', tokens, 'maps/World.hexer.md'))
            .toBe('maps/notes/03-05.md');
    });

    it('anchors a leading-slash convention at the vault root', () => {
        expect(resolveHexNotePath('/hexes/{{col}},{{row}}', tokens, 'maps/World.hexer.md'))
            .toBe('hexes/03,05.md');
    });

    it('resolves relative to the vault root when the map file sits there', () => {
        expect(resolveHexNotePath('{{col}}-{{row}}', tokens, 'World.hexer.md'))
            .toBe('03-05.md');
    });

    it('preserves the sign while zero-padding negative coordinates', () => {
        expect(resolveHexNotePath('{{col}}_{{row}}', { col: -3, row: -12 }, 'World.hexer.md'))
            .toBe('-03_-12.md');
    });

    it('does not pad coordinates already three or more digits wide', () => {
        expect(resolveHexNotePath('{{col}}_{{row}}', { col: 100, row: 5 }, 'World.hexer.md'))
            .toBe('100_05.md');
    });

    it('does not double up an .md the convention already carries', () => {
        expect(resolveHexNotePath('{{col}}.md', { col: 1, row: 2 }, 'World.hexer.md'))
            .toBe('01.md');
    });

    it('resolves .. segments against the map folder', () => {
        expect(resolveHexNotePath('../shared/{{col}}', { col: 4, row: 0 }, 'maps/sub/World.hexer.md'))
            .toBe('maps/shared/04.md');
    });
});

describe('applyNoteTemplate', () => {
    it('substitutes the natural (unpadded) coordinate tokens throughout the text', () => {
        expect(applyNoteTemplate('# Hex {{col}},{{row}}\n\ncol={{col}}', { col: 3, row: 5 }))
            .toBe('# Hex 3,5\n\ncol=3');
    });
});
