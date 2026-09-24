# Releases are cut by pushing a version tag

`npm version` is the only way a version number changes: it bumps
`package.json`, mirrors the number into `manifest.json`, records
`version -> minAppVersion` in `versions.json`, commits, and tags the commit
`x.y.z`. Pushing that tag runs `.github/workflows/release.yml`, which rebuilds
from a clean checkout and attaches `main.js`, `manifest.json` and `styles.css`
to a **draft** GitHub release for the maintainer to publish. Obsidian's
contract — a release whose tag is exactly the manifest version, carrying those
three files — is therefore satisfied by construction rather than by care.

## Considered options

- **Tag-triggered workflow, draft release (chosen).** Matches Obsidian's own
  recommended workflow. The draft step keeps the maintainer in the loop for
  release notes, and nothing reaches users until they click publish.
- **Tag-triggered workflow that publishes immediately.** Rejected: a published
  release is what the community directory polls, so a mistake is live before it
  can be read, and generated notes ship unedited.
- **Build and upload by hand.** Rejected: the version lives in four places
  (`package.json`, `manifest.json`, `versions.json`, the tag) and the files to
  attach are build output that is git-ignored — exactly the shape of task that
  goes wrong quietly, by shipping a dev build or a `v`-prefixed tag.
- **`semantic-release` / `release-please`.** Rejected as overkill for a
  single-maintainer plugin: both derive versions from commit conventions this
  repo doesn't follow, and both default to `v`-prefixed tags, which is the one
  thing Obsidian will not accept.

## Consequences

- The workflow triggers only on tags matching `[0-9]+.[0-9]+.[0-9]+`, so a
  stray `v0.1.0` tag does nothing rather than producing a release Obsidian
  ignores. `.npmrc` sets `tag-version-prefix=""` so `npm version` cannot create
  one in the first place.
- The workflow re-checks the tag against `manifest.json` and fails the build on
  a mismatch; a missing `versions.json` entry warns instead of failing, since
  Obsidian only requires an entry when `minAppVersion` changes.
- `minAppVersion` stays a deliberate, hand-edited decision — the bump script
  copies it, never raises it.
- The release build runs `npm run build` and the unit tests, not e2e. The PR
  that merged the code already ran the full CI matrix, and e2e needs a virtual
  display and an Obsidian download for little added signal at tag time.
- No build provenance attestation, which Obsidian's template includes:
  `actions/attest` needs a public repository (or Advanced Security). Worth
  adding in the same change that makes the repo public.
- Listing in the community directory additionally needs a public repo, a
  `README.md`, and an `id`/`name` without "Obsidian" in them. `RELEASING.md`
  carries that checklist; none of it blocks cutting releases on GitHub.
