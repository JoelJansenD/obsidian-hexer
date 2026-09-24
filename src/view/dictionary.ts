import en from './dictionary.en.json';

/**
 * The lexicon of user-facing display strings, resolved by key (see CONTEXT.md
 * "Dictionary"). Every displayed string lives in a `dictionary.<lang>.json`
 * file; the UI never holds an inline literal, so all wording is edited in one
 * place. English is the **base dictionary** — the source of truth for which
 * keys exist. Additional languages are added as their own `dictionary.<lang>.json`
 * files that may omit keys and fall back to English; runtime discovery and
 * activation of them is tracked in #88.
 */

// The base dictionary: English. `keyof` it gives every valid key, so `t` only
// accepts keys that actually exist and `tsc` catches a typo at every call site.
const BASE_DICTIONARY = en;

/** Every valid dictionary key, derived from the base (English) dictionary. */
export type DictionaryKey = keyof typeof en;

// A non-default dictionary may omit keys; a missing one falls back to the base.
type Dictionary = Partial<Record<DictionaryKey, string>>;

// The dictionaries available by language code. Only English ships today; a new
// language is added by dropping in a dictionary.<lang>.json and registering it
// here (auto-discovery is #88).
const DICTIONARIES: Record<string, Dictionary> = {
    en,
};

// The language whose dictionary is active. Hardcoded to English for now:
// reading Obsidian's UI language is dead code until a second language exists
// (tracked in #88), so only the seam is in place.
function getActiveLanguage(): string {
    return 'en';
}

// Fills `{token}` placeholders from `params`. An unfilled placeholder is left as
// its literal `{token}`, so instructional copy carrying `{{col}}`/`{{row}}`
// survives untouched when no matching param is supplied.
function interpolate(template: string, params: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, token: string) =>
        Object.prototype.hasOwnProperty.call(params, token) ? params[token] : match);
}

/**
 * Resolves a display string by key from the active dictionary, falling back to
 * the base (English) dictionary, and throwing if the key exists in neither.
 * Pass `params` to fill `{token}` placeholders in the value.
 */
export function t(key: DictionaryKey, params?: Record<string, string>): string {
    const template = DICTIONARIES[getActiveLanguage()]?.[key] ?? BASE_DICTIONARY[key];
    if (template === undefined) {
        throw new Error(`Missing dictionary key: ${String(key)}`);
    }
    return params ? interpolate(template, params) : template;
}
