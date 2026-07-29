# Credits

Obsidian Hexer is licensed under the [GPL-3.0](LICENSE) license. It builds on the
open source projects listed below. The licenses of these projects require that
their copyright and permission notices are retained, so they are reproduced here
in full.

## Bundled in the released plugin

These projects are compiled into the distributed `main.js`.

### Lucide

- Website: <https://lucide.dev>
- Source: <https://github.com/lucide-icons/lucide>
- License: ISC

Obsidian Hexer uses the Lucide icons `brush`, `chevron-down`, `eraser`,
`mouse-pointer-2`, `mountain`, `paint-bucket`, `pentagon` and `shapes`.

```
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### Feather (via Lucide)

- Source: <https://github.com/feathericons/feather>
- License: MIT

A number of Lucide icons are derived from the Feather project. Of the icons used
by this plugin, `chevron-down` is one of them.

```
The MIT License (MIT)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Game-icons.net

- Website: <https://game-icons.net/>
- Source: <https://github.com/game-icons/icons>
- License: [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/)
  — full legal code: <https://creativecommons.org/licenses/by/3.0/legalcode>

Game-icons.net icons are contributed by many different authors, and CC BY 3.0
requires each author to be credited individually. The table below lists every
game-icons.net icon shipped with this plugin and its author. All of them are
used under CC BY 3.0 and some have been modified (recoloured and/or resized) for
use in Obsidian Hexer.

| Icon | Author |
| --- | --- |
| Castle | [Delapouite](https://delapouite.com/) |
| Dungeon gate | [Delapouite](https://delapouite.com/) |

You are free to share and adapt these icons for any purpose, including
commercially, provided you give appropriate credit, link to the license, and
indicate if changes were made.

## Build and development tooling

These projects are not shipped with the plugin — they are used only to build,
lint and test it. They are credited here as an acknowledgement rather than out
of a licensing obligation on the released artifact.

| Project | License |
| --- | --- |
| [obsidian](https://github.com/obsidianmd/obsidian-api) (API typings) | MIT |
| [esbuild](https://github.com/evanw/esbuild) | MIT |
| [TypeScript](https://www.typescriptlang.org/) | Apache-2.0 |
| [tslib](https://github.com/Microsoft/tslib) | 0BSD |
| [ESLint](https://eslint.org) | MIT |
| [typescript-eslint](https://typescript-eslint.io) | MIT |
| [eslint-import-resolver-typescript](https://github.com/import-js/eslint-import-resolver-typescript) | ISC |
| [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) | MIT |
| [Vitest](https://vitest.dev) | MIT |
| [WebdriverIO](https://webdriver.io) (`@wdio/cli`, `@wdio/local-runner`, `@wdio/cucumber-framework`) | MIT |
| [wdio-obsidian-service / wdio-obsidian-reporter](https://github.com/jesse-r-s-hines/wdio-obsidian-service) | MIT |
| [builtin-modules](https://github.com/sindresorhus/builtin-modules) | MIT |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped), [@types/mocha](https://github.com/DefinitelyTyped/DefinitelyTyped) | MIT |

Full license texts for every transitive dependency are available in each
package's directory under `node_modules/`.
