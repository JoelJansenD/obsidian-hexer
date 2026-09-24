# Releasing Hexer

Obsidian installs a plugin from a **GitHub release whose tag is exactly the `manifest.json` version** — `0.1.0`, never `v0.1.0` — with `main.js`, `manifest.json` and `styles.css` attached as files. Everything below exists to make that one rule impossible to get wrong.

## Cutting a release

1. Make sure `main` holds everything the release should contain, and that you are on it with a clean tree: `git switch main && git pull`.
2. If this release needs a newer Obsidian than the last one, edit `minAppVersion` in `manifest.json` and commit that first, on its own.
3. Bump:

   ```sh
   npm version patch   # or: minor / major
   ```

   This runs `version-bump.mjs`, which writes the new number into `manifest.json` and records `version -> minAppVersion` in `versions.json`; npm then commits all four files and tags the commit. The tag has no `v` prefix because `.npmrc` sets `tag-version-prefix=""`.
4. Push the commit and the tag:

   ```sh
   git push --follow-tags
   ```

5. The **Release** workflow (`.github/workflows/release.yml`) picks up the tag, re-checks it against `manifest.json`, builds, runs the unit tests, publishes the release with the three files attached, and then re-reads the release to confirm all three actually arrived. Give it about a minute; the run's summary links the release and lists its assets.
6. Edit the generated notes on the release if you want to say more than the commit list does.

**Never build a release by hand from the tag page.** Creating a release in the GitHub UI from an existing tag gives you a release with no plugin files on it — GitHub's two "Source code" archives are generated for every tag and are not the assets Obsidian needs. If a release came out wrong, delete it and re-cut (below) so the workflow is the only thing that ever produces one.

### The very first release (0.1.0)

`manifest.json` and `versions.json` already say `0.1.0`, so there is nothing to bump — tag the commit directly:

```sh
git tag 0.1.0
git push origin 0.1.0
```

Use `npm version` for every release after that.

### If something goes wrong

The workflow publishes as soon as it finishes, so a bad release is briefly live. Before the plugin is listed in the community directory that costs nothing: delete the release along with its tag (`gh release delete <version> --cleanup-tag`), fix the problem, and push the tag again. **After** it is listed, leave a published version alone and ship a new patch instead — Obsidian caches releases by version, and users who already updated will not see a replaced one.

If the run fails at **Verify the attached assets**, the release exists but is short a file. Delete it and re-cut rather than uploading the missing file by hand, so the release always matches a build the workflow made.

## Installing a release by hand

Until the plugin is in the community directory, testers install it by dropping the three release files into `<vault>/.obsidian/plugins/hexer/` and enabling it in **Settings → Community plugins**. The folder name must match the `id` in `manifest.json`.

## Submitting to the community plugin directory (one time)

Obsidian's directory reads the `manifest.json` at the head of the default branch and the release matching its version. Before submitting, the repository must satisfy all of this:

- [ ] **Public repository** — the directory cannot read a private repo.
- [ ] **`README.md`** at the root, describing what the plugin is and how to use it. Present, but still a placeholder — flesh out the usage guide before submitting, since the directory's review reads it.
- [x] **`LICENSE`** at the root (GPL-3.0).
- [x] **`manifest.json`** at the root of `main`, matching the latest published release.
- [x] **`id`** — lowercase letters and hyphens only, must **not** contain `obsidian`, must not end in `plugin`. Now `hexer`.
- [x] **`name`** — short, Basic Latin, no variation of "Obsidian", not the word "Plugin", not a core plugin's name. Now `Hexer`.
- [x] **`description`** — one line about what the plugin does, without restating that it is an Obsidian plugin.
- [ ] **A published release** whose tag equals the manifest version, with `main.js`, `manifest.json` and `styles.css` attached.

The `id` moved from `obsidian-hexer` to `hexer` before 0.1.0 for exactly this reason: it names the folder the plugin lives in inside every vault, so changing it after a public release breaks every existing install. Renaming it means renaming the development vault's folder to `.obsidian/plugins/hexer` too.

Then: sign in at [community.obsidian.md](https://community.obsidian.md) with your Obsidian account, link the GitHub account that owns the repo, and add the plugin. The directory reviews the submission automatically and tells you what to fix; you respond by pushing fixes and publishing a **new, higher** version.

## Where the version lives

| File | Holds | Updated by |
| --- | --- | --- |
| `package.json` | `version` | `npm version` |
| `manifest.json` | `version`, `minAppVersion` | `version-bump.mjs` (version); by hand (minAppVersion) |
| `versions.json` | `version -> minAppVersion` for each release | `version-bump.mjs` |
| the git tag | the release | `npm version` |

The release workflow refuses to build if the tag and `manifest.json` disagree, and warns if `versions.json` has no entry for the version being released.
