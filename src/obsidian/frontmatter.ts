import { parseYaml, stringifyYaml } from "obsidian";
import { HexerData, SerializedHexerData } from "../logic/HexerData";

/** Matches the leading `---\n...\n---` YAML frontmatter block of a Hexer file. */
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

/**
 * A Hexer file's frontmatter: the serialized map nested under a `hexer` key, so
 * it coexists with any other frontmatter Obsidian may write.
 */
export interface HexerFrontmatter {
    hexer: SerializedHexerData;
}

export function toFrontmatter(data: HexerData): HexerFrontmatter {
    return { hexer: data.toJSON() };
}

export function fromFrontmatter(frontmatter: HexerFrontmatter): HexerData {
    return HexerData.fromJSON(frontmatter.hexer);
}

/**
 * Reads a Hexer document string into {@link HexerData} by parsing its leading
 * YAML frontmatter block.
 */
export function parseHexerDocument(data: string): HexerData {
    const match = FRONTMATTER_REGEX.exec(data);
    if (!match) {
        // TODO: Display warning and go to markdown view
        throw new Error('Invalid Hexer file: Missing frontmatter');
    }

    const frontmatter = parseYaml(match[1]) as HexerFrontmatter;
    return fromFrontmatter(frontmatter);
}

/**
 * Writes {@link HexerData} back into a Hexer document string, replacing the YAML
 * frontmatter block while preserving the markdown body that follows it.
 */
export function serializeHexerDocument(data: HexerData, existing: string): string {
    const frontmatter = stringifyYaml(toFrontmatter(data)).trim();
    const match = FRONTMATTER_REGEX.exec(existing);
    const body = match ? existing.slice(match[0].length) : '';
    return `---\n${frontmatter}\n---${body}`;
}
