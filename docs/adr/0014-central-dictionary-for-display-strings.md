# Display strings live in a central dictionary

Every user-facing string (labels, tooltips, modal copy, notices, command names, and the default names new items are seeded with) is resolved by key through `t()` from `src/view/dictionary.ts`, backed by a flat `dictionary.en.json`, instead of being written inline at its point of use. This gives one place to review and edit all copy before 1.0 and lays the groundwork for localisation, without translating anything yet.

## Considered options

- **JSON file (chosen).** Imported as a typed object in both esbuild (`bundle: true`) and Vite/Vitest with zero loader or test setup, so `type DictionaryKey = keyof typeof en` gives compile-time key checking at every call site.
- **A standalone `.properties`/plaintext file.** Rejected: esbuild's text loader and Vite resolve non-JS assets differently (the same divergence the SVG imports already live with), so component tests — which assert rendered copy constantly — would need extra raw-import shimming or every lookup would miss.
- **A typed TS object literal.** Equivalent typing, but a plain data file keeps copy editable without touching code and is the natural unit to swap per language.

## Consequences

- The dictionary lives in the `view` layer so both `view` and `obsidian` can reach it (ADR-0004); `logic` never uses it.
- English is the **base dictionary** and the source of truth for which keys exist. A missing key throws — a closed set at build time, so it never surfaces to users. Adding a language is meant to be nothing more than adding a `dictionary.<lang>.json` file.
- This change ships English only, statically imported. The active language is hardcoded to `'en'` behind a `getActiveLanguage()` seam; reading Obsidian's UI language and auto-discovering additional dictionary files (where the esbuild-vs-Vitest glob mechanism must be resolved against a real second locale) is deferred to [#88](https://github.com/JoelJansenD/obsidian-hexer/issues/88).
- Non-displayed identifiers (CSS classes, `data-*` test hooks) and developer-only `console.error` diagnostics deliberately stay inline.
