import { LabelCoordinates } from "./hexagon";

/**
 * The convention a map falls back to when none is configured. Hex-note
 * navigation is always active (ADR 0013), so an unset convention resolves
 * against this default rather than switching the feature off: a note named for
 * the hex's zero-padded `col`/`row`, sitting next to the map file.
 */
export const DEFAULT_NOTE_CONVENTION = '{{col}}{{row}}';

// Formats a coordinate component for a token substitution. Note paths pad to a
// minimum of two digits (sign kept outside the padding, so `-3` reads as `-03`)
// to keep filenames fixed-width and sortable; a template body wants the natural
// number instead, so padding is opt-in.
function formatComponent(value: number, pad: boolean): string {
    const sign = value < 0 ? '-' : '';
    const digits = String(Math.abs(value));
    return sign + (pad ? digits.padStart(2, '0') : digits);
}

function substituteTokens(text: string, tokens: LabelCoordinates, pad: boolean): string {
    return text
        .replace(/\{\{col\}\}/g, formatComponent(tokens.col, pad))
        .replace(/\{\{row\}\}/g, formatComponent(tokens.row, pad));
}

/**
 * Substitutes the `{{col}}`/`{{row}}` tokens in a note template's contents with
 * the hex's coordinate label, using the natural (unpadded) numbers so prose
 * reads `Hex 3,5` rather than the zero-padded form the filename carries.
 */
export function applyNoteTemplate(content: string, tokens: LabelCoordinates): string {
    return substituteTokens(content, tokens, false);
}

/**
 * Resolves the vault-absolute path of the note a hex opens. Hex-note navigation
 * is always active, so an empty or unset `convention` falls back to
 * {@link DEFAULT_NOTE_CONVENTION} rather than turning the feature off.
 *
 * The convention is a template with `{{col}}`/`{{row}}` tokens (the hex's
 * coordinate label, zero-padded to a minimum of two digits, sign preserved);
 * `.md` is appended when absent. A leading `/` anchors the result at the vault
 * root, otherwise it is resolved relative to the folder holding the map file
 * (`mapFilePath`), collapsing any `.`/`..` segments. See ADR 0013.
 */
export function resolveHexNotePath(convention: string, tokens: LabelCoordinates, mapFilePath: string): string {
    const trimmed = (convention ?? '').trim() || DEFAULT_NOTE_CONVENTION;

    let path = substituteTokens(trimmed, tokens, true);
    if (!path.toLowerCase().endsWith('.md')) {
        path += '.md';
    }

    if (path.startsWith('/')) {
        return normalizeVaultPath(path.slice(1));
    }

    const folder = mapFolder(mapFilePath);
    return normalizeVaultPath(folder ? `${folder}/${path}` : path);
}

// The folder portion of a vault path — everything before the last slash, or the
// empty string (vault root) when the file sits at the top level.
function mapFolder(mapFilePath: string): string {
    const slash = mapFilePath.lastIndexOf('/');
    return slash === -1 ? '' : mapFilePath.slice(0, slash);
}

// Collapses '.'/'..' segments and stray slashes into a clean vault path.
function normalizeVaultPath(path: string): string {
    const segments: string[] = [];
    for (const segment of path.split('/')) {
        if (segment === '' || segment === '.') {
            continue;
        }
        if (segment === '..') {
            segments.pop();
            continue;
        }
        segments.push(segment);
    }
    return segments.join('/');
}
