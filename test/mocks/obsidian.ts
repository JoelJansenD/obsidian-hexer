// Runtime stub for the `obsidian` package under vitest. The real package ships
// only type definitions (no runtime entry), so any tested module that imports
// from `obsidian` needs this shim. Only the YAML helpers are stubbed today;
// they are backed by the same `yaml` library Obsidian uses internally, so the
// round-trip behaviour matches production closely enough for unit tests.
import { parse, stringify } from 'yaml';

export function parseYaml(input: string): unknown {
    return parse(input);
}

export function stringifyYaml(input: unknown): string {
    return stringify(input);
}
