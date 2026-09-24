# Releasing Hexer

Obsidian installs a plugin from a **GitHub release whose tag is exactly the
`manifest.json` version** — `0.1.0`, never `v0.1.0` — with `main.js`,
`manifest.json` and `styles.css` attached as files. Everything below exists to
make that one rule impossible to get wrong.

## Cutting a release

1. Make sure `main` holds everything the release should contain, and that you
   are on it with a clean tree: `git switch main && git pull`.
2. If this release needs a newer Obsidian than the last one, edit
   `minAppVersion` in `manifest.json` and commit that first, on its own.
3. Bump:

   ```sh
   npm version patch   # or: minor / major
   ```

   This runs `version-bump.mjs`, which writes the new number into
   `manifest.json` and records `version -> minAppVersion` in `versions.json`;
   npm then commits all four files and tags the commit. The tag has no `v`
   prefix because `.npmrc` sets `tag-version-prefix=""`.
4. Push the commit and the tag:

   ```sh
   git push --follow-tags
   ```

5. The **Release** workflow (`.github/workflows/release.yml`) picks up the tag,
   re-checks it against `manifest.json`, builds, runs the unit tests, and
   creates a **draft** release with the three files attached.
6. Open the draft on GitHub, edit the generated notes, and **publish** it.
   Obsidian only ever sees published releases.

### The very first release (0.1.0)

`manifest.json` and `versions.json` already say `0.1.0`, so there is nothing to
bump — tag the commit directly:

```sh
git tag 0.1.0
git push origin 0.1.0
```

Use `npm version` for every release after that.

### If something goes wrong

The workflow only drafts; nothing is public until you publish. To redo a draft,
delete it along with its tag (`gh release delete <version> --cleanup-tag`), fix
the problem, and push the tag again. Once a version is *published*, leave it
alone and release a new patch instead — Obsidian caches releases by version.

## Installing a release by hand

Until the plugin is in the community directory, testers install it by dropping
the three release files into `<vault>/.obsidian/plugins/<plugin-id>/` and
enabling it in **Settings → Community plugins**. The folder name must match the
`id` in `manifest.json`.

## Submitting to the community plugin directory (one time)

Obsidian's directory reads the `manifest.json` at the head of the default
branch and the release matching its version. Before submitting, the repository
must satisfy all of this:

- [ ] **Public repository** — the directory cannot read a private repo.
- [ ] **`README.md`** at the root, describing what the plugin is and how to use it.
- [ ] **`LICENSE`** at the root. ✔ (GPL-3.0)
- [ ] **`manifest.json`** at the root of `main`, matching the latest published release. ✔
- [ ] **`id`** — lowercase letters and hyphens only, must **not** contain
      `obsidian`, must not end in `plugin`. Currently `obsidian-hexer`, which
      fails this check.
- [ ] **`name`** — short, Basic Latin, no variation of "Obsidian", not the word
      "Plugin", not a core plugin's name. Currently `Obsidian Hexer`, which
      fails this check.
- [ ] **`description`** — one line about what the plugin does, without
      restating that it is an Obsidian plugin.
- [ ] **A published release** whose tag equals the manifest version, with
      `main.js`, `manifest.json` and `styles.css` attached.

Changing `id` renames the folder the plugin lives in inside every vault, so do
it **before** the first public release, not after.

Then: sign in at [community.obsidian.md](https://community.obsidian.md) with
your Obsidian account, link the GitHub account that owns the repo, and add the
plugin. The directory reviews the submission automatically and tells you what
to fix; you respond by pushing fixes and publishing a **new, higher** version.

## Where the version lives

| File | Holds | Updated by |
| --- | --- | --- |
| `package.json` | `version` | `npm version` |
| `manifest.json` | `version`, `minAppVersion` | `version-bump.mjs` (version); by hand (minAppVersion) |
| `versions.json` | `version -> minAppVersion` for each release | `version-bump.mjs` |
| the git tag | the release | `npm version` |

The release workflow refuses to build if the tag and `manifest.json` disagree,
and warns if `versions.json` has no entry for the version being released.
