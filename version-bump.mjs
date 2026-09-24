// Keeps the three places a version lives in sync.
//
// Run through npm's `version` lifecycle hook (see package.json), so
// `npm version <patch|minor|major>` bumps package.json and then this script
// mirrors the new number into manifest.json and records the release's
// minAppVersion in versions.json.
import { readFileSync, writeFileSync } from 'fs';

const targetVersion = process.env.npm_package_version;

if (!targetVersion) {
    throw new Error(
        'npm_package_version is not set. Run this through `npm version <patch|minor|major>`, not directly.',
    );
}

if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
    throw new Error(
        `Obsidian requires a plain x.y.z version; got "${targetVersion}".`,
    );
}

// The checked-in JSON uses CRLF on Windows; keep whatever the file already has
// so a version bump shows up as a one-line diff.
function writeJson(path, value, source) {
    const json = JSON.stringify(value, null, 4) + '\n';
    writeFileSync(path, source.includes('\r\n') ? json.replace(/\n/g, '\r\n') : json);
}

const manifestSource = readFileSync('manifest.json', 'utf8');
const manifest = JSON.parse(manifestSource);
const { minAppVersion } = manifest;

manifest.version = targetVersion;
writeJson('manifest.json', manifest, manifestSource);

// versions.json maps each plugin version to the Obsidian version it needs, so
// users on an older Obsidian are offered the last release that still runs there.
const versionsSource = readFileSync('versions.json', 'utf8');
const versions = JSON.parse(versionsSource);

versions[targetVersion] = minAppVersion;
writeJson('versions.json', versions, versionsSource);

console.log(`Bumped to ${targetVersion} (minAppVersion ${minAppVersion}).`);
