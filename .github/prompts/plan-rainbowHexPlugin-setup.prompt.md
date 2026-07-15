# Plan: Obsidian Hexer — project config + rainbow hex feature

## Goal

Set up the greenfield `obsidian-hexer` plugin from scratch and deliver a view that renders a single hex which cycles through the 7 rainbow colours (ROYGBIV) on click. The feature is split across three layers, with import boundaries enforced mechanically by `eslint-plugin-boundaries`, plus Vitest unit tests and real-Obsidian E2E tests via `wdio-obsidian-service`.

## Hard constraints

- `logic/` MUST NOT import from `rendering/`, `obsidian/`, or the `obsidian` npm module.
- `rendering/` MUST NOT import from `obsidian/` or the `obsidian` npm module.
- `obsidian/` may import from `rendering/`, `logic/`, and the `obsidian` module.
- Enforced mechanically via `eslint-plugin-boundaries` (element-types + external rules).

## Decisions

- Unit runner: **Vitest**
- E2E: **real Obsidian via `wdio-obsidian-service`** (headless with xvfb on Linux)
- Boundaries: **eslint-plugin-boundaries**
- CI: **none** (scripts only)
- Bundler: **esbuild** (Obsidian standard)
- View: **ItemView** opened via ribbon icon + command (simplest for a single-hex demo)
- Logic stays colour-agnostic (index only); colour strings live in rendering.

## Layer design for the feature

- **logic/** — `RainbowHexState { colorIndex }` + `cycle()` advancing `index mod 7`. Pure state machine; no colour strings, no geometry.
- **rendering/** — `RAINBOW_COLORS[7]`, hex-corner geometry, `renderHex(state, viewport) → DrawCommand[]` (pure), and a thin `paint(ctx, cmds)`. DOM canvas types are fine — the ban is on the `obsidian` module.
- **obsidian/** — `HexerPlugin` (registerView + ribbon + command) and `HexerView` (ItemView): creates the canvas, wires click → `cycle` → `renderHex` → `paint`, and mirrors state to a `data-color-index` attribute for E2E.

## Phases

### Phase 1 — Base tooling & build config

- devDeps: `typescript`, `obsidian`, `esbuild`, `builtin-modules`, `@types/node`, `tslib`
- `tsconfig.json`: strict, target ES2018, module ESNext, moduleResolution bundler/node, lib DOM+ES2018, noImplicitAny, isolatedModules, include `src/`.
- `esbuild.config.mjs`: entry `src/obsidian/main.ts` → `main.js` (cjs, bundle), external: `obsidian`, electron, `@codemirror/*`, `@lezer/*`, builtin-modules. dev watch + prod minify.
- `manifest.json`: id `obsidian-hexer`, name, version 0.1.0, minAppVersion, description, author, isDesktopOnly false.
- `versions.json`: `{ "0.1.0": "<minAppVersion>" }`.
- `package.json` scripts: `dev` (esbuild watch), `build` (tsc --noEmit + esbuild prod).
- `.gitignore`: node_modules, main.js, *.js.map, test artifacts.

### Phase 2 — Layer structure + boundary enforcement

- Create `src/logic/`, `src/rendering/`, `src/obsidian/`.
- eslint deps: `eslint`, `typescript-eslint`, `eslint-plugin-boundaries`.
- `eslint.config.mjs` (flat):
  - settings `boundaries/elements`: logic=`src/logic/*`, rendering=`src/rendering/*`, obsidian=`src/obsidian/*`
  - `boundaries/element-types`: logic allow `[]`, rendering allow `[logic]`, obsidian allow `[logic, rendering]`
  - `boundaries/external`: logic disallow `["obsidian"]`, rendering disallow `["obsidian"]`, obsidian allow all
- `package.json` script: `lint` (eslint src).

### Phase 3 — Feature implementation

- `src/logic/RainbowHex.ts`: `RAINBOW_LENGTH=7`, `RainbowHexState`, `createHexState()`, `cycle()`.
- `src/rendering/`: `DrawCommand.ts`, `Viewport.ts`, `colors.ts` (`RAINBOW_COLORS`), `geometry.ts` (`hexCorners`), `renderHex.ts`, `paint.ts`.
- `src/obsidian/`: `HexerView.ts` (ItemView, canvas, click wiring, `data-color-index` attr), `HexerPlugin.ts`, `main.ts` (default export).

### Phase 4 — Unit tests (Vitest)

- devDeps: `vitest`.
- `vitest.config.ts`: environment node (logic + rendering are pure; no jsdom needed since we assert on `DrawCommand[]` and `paint` isn't unit-tested). include `src/**/*.test.ts`.
- tests: `logic/RainbowHex.test.ts` (cycle advances, wraps 6→0); `rendering/renderHex.test.ts` (colour for index, wrap, command count/shape).
- scripts: `test` (vitest run), `test:watch`.

### Phase 5 — E2E (wdio-obsidian-service)

- devDeps: `@wdio/cli`, `@wdio/local-runner`, `@wdio/mocha-framework`, `wdio-obsidian-service`, `wdio-obsidian-reporter`.
- `test/vault/` minimal vault; wdio installs the built plugin.
- `wdio.conf.ts`: obsidian service, downloads Obsidian version, points at `test/vault`, loads plugin.
- `test/e2e/hex.e2e.ts`: open view via command, read `data-color-index`, click canvas, assert index advanced; click 7× asserts wrap to 0. Optional: canvas `getImageData` pixel check.
- scripts: `build` (needed first), `e2e` (wdio run). Note `xvfb-run` wrapper for Linux/CI.

## Relevant files (to be created)

- Config: `manifest.json`, `versions.json`, `tsconfig.json`, `esbuild.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `wdio.conf.ts`, `package.json`, `.gitignore`
- `src/logic/RainbowHex.ts` (+ `.test.ts`)
- `src/rendering/{DrawCommand,Viewport,colors,geometry,renderHex,paint}.ts` (+ `renderHex.test.ts`)
- `src/obsidian/{main,HexerPlugin,HexerView}.ts`
- `test/vault/*`, `test/e2e/hex.e2e.ts`

## Verification

1. `npm run lint` — passes; deliberately adding `import 'obsidian'` in a logic file **fails** lint (proves boundary enforcement).
2. `npm run build` — tsc typecheck clean, `main.js` emitted.
3. `npm test` — logic + rendering unit tests green.
4. `npm run e2e` — Obsidian launches, view opens, click cycles colour, wrap verified.
5. Manual: enable plugin in a real vault, open view, click hex, observe rainbow cycle.

## Excluded

- File/vault persistence (no `FileStore` port), multi-hex maps, pan/zoom.

## Further considerations

1. **E2E assertion mechanism** — `data-color-index` attribute (recommended, deterministic) vs canvas `getImageData` pixel sampling (more realistic, flakier). Recommend attribute primary, pixel check optional.
2. **Colour ownership** — keep colour strings in rendering (recommended, per plan) vs moving them to logic. Plan keeps logic colour-agnostic (index only).
