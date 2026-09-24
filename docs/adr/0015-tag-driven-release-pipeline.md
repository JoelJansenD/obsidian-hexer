# Releases are cut by pushing a version tag

`npm version` is the only way a version number changes: it bumps `package.json`, mirrors the number into `manifest.json`, records `version -> minAppVersion` in `versions.json`, commits, and tags the commit `x.y.z`. Pushing that tag runs `.github/workflows/release.yml`, which rebuilds from a clean checkout, publishes a GitHub release carrying `main.js`, `manifest.json` and `styles.css`, and then re-reads the release to confirm all three are on it. Obsidian's contract — a release whose tag is exactly the manifest version, carrying those three files — is therefore satisfied by construction rather than by care.

## Considered options

- **Tag-triggered workflow that publishes immediately (chosen).** The tag page shows the release and its files the moment the run finishes, which is what someone who just pushed a tag goes looking for.
- **Tag-triggered workflow, draft release.** Obsidian's own template drafts, and drafting keeps a mistake out of the directory's reach until a human reads it. Rejected after trying it: a draft does not appear on its own tag page at all. `releases/tag/0.0.1` renders GitHub's generated source archives and nothing else, so a correct draft is indistinguishable from a release whose upload failed — and the natural repair, building a release from the tag in the UI, produces a real release with no plugin files on it. That happened on the first two attempts at 0.0.1. The failure mode is worse than the one drafting was protecting against, because it is silent and looks like success.
- **Build and upload by hand.** Rejected: the version lives in four places (`package.json`, `manifest.json`, `versions.json`, the tag) and the files to attach are build output that is git-ignored — exactly the shape of task that goes wrong quietly, by shipping a dev build or a `v`-prefixed tag.
- **`semantic-release` / `release-please`.** Rejected as overkill for a single-maintainer plugin: both derive versions from commit conventions this repo doesn't follow, and both default to `v`-prefixed tags, which is the one thing Obsidian will not accept.

## Consequences

- The workflow triggers only on tags matching `[0-9]+.[0-9]+.[0-9]+`, so a stray `v0.1.0` tag does nothing rather than producing a release Obsidian ignores. `.npmrc` sets `tag-version-prefix=""` so `npm version` cannot create one in the first place.
- The workflow re-checks the tag against `manifest.json` and fails the build on a mismatch; a missing `versions.json` entry warns instead of failing, since Obsidian only requires an entry when `minAppVersion` changes.
- Publishing immediately means a bad release is briefly live, so the workflow re-reads the release afterwards and fails if any of the three files is absent. Between that and the tag/manifest check, the remaining risk is shipping working-but-unwanted code, which a tag push is a deliberate enough act to cover. Once the plugin is listed in the directory, a published version can no longer be quietly replaced — `RELEASING.md` says to ship a patch instead.
- `minAppVersion` stays a deliberate, hand-edited decision — the bump script copies it, never raises it.
- The release build runs `npm run build` and the unit tests, not e2e. The PR that merged the code already ran the full CI matrix, and e2e needs a virtual display and an Obsidian download for little added signal at tag time.
- No build provenance attestation, which Obsidian's template includes: `actions/attest` needs a public repository (or Advanced Security). Worth adding in the same change that makes the repo public.
- Obsidian's directory rejects an `id` containing "obsidian" or a `name` containing a variation of it, so the plugin was renamed `obsidian-hexer` -> `hexer` and "Obsidian Hexer" -> "Hexer" before the first release: the `id` names the plugin's folder in every vault, and changing it after a public release breaks every existing install. The UI already called itself "Hexer".
- What still stands between this and a directory listing is a public repo and a `README.md`. `RELEASING.md` carries the checklist; neither blocks cutting releases on GitHub.
