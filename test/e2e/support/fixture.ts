import { CURRENT_VERSION } from "../../../src/logic/HexerData";
import { RadialCoordinates } from "../../../src/logic/hexagon";

/**
 * A stable id for the river a scenario seeds, so steps can target it by id after
 * it has been written into the open view.
 */
export const SEEDED_RIVER_ID = '00000000-0000-4000-8000-000000000001';

export interface SeedRiver {
    id: string;
    name: string;
    nodes: RadialCoordinates[];
}

export interface SeedFaction {
    id: string;
    name: string;
    color: string;
    filePath?: string | null;
}

// Two stable factions a scenario can seed, so steps can target them by id after
// they have been written into the open view. When seeded, the first faction is
// painted onto the first three standard hexes (see below).
export const SEEDED_FACTIONS: SeedFaction[] = [
    { id: '00000000-0000-4000-8000-000000000101', name: 'The Verdant Circle', color: '#3355ff' },
    { id: '00000000-0000-4000-8000-000000000102', name: 'The Ashen Pact', color: '#ff8800' },
];

// How many of the standard hexes the first seeded faction claims.
const SEEDED_FACTION_HEX_COUNT = 3;

// The hexes every Hexer fixture file starts with. Terrain and icon scenarios act
// on these (e.g. "a hex with colored terrain"), so they stay constant.
const STANDARD_HEXES: RadialCoordinates[] = [
    { q: 1, r: 1 },
    { q: 2, r: 1 },
    { q: 2, r: 2 },
    { q: 3, r: 1 },
];

/**
 * Builds the frontmatter for a Hexer file. Each seeded river gets its nodes plus
 * edges connecting consecutive nodes (node 1 to 2, node 2 to 3, ...), matching
 * how a river reads when defined by a scenario.
 */
export function buildHexerFileContent(rivers: SeedRiver[] = [], factions: SeedFaction[] = []): string {
    const lines: string[] = [
        '---',
        'hexer:',
        `  version: "${CURRENT_VERSION}"`,
        '  size: 50',
        '  hexes:',
    ];

    STANDARD_HEXES.forEach((hex, index) => {
        lines.push(
            `    "${hex.q},${hex.r}":`,
            `      q: ${hex.q}`,
            `      r: ${hex.r}`,
            '      terrainColor: "#ff0000"',
            '      icon:',
            '        name: "dungeon-gate"',
            '        color: "#00ff00"',
        );

        // When factions are seeded, the first faction claims the first few hexes
        // so scenarios have a region already on the map to act on.
        if (factions.length > 0 && index < SEEDED_FACTION_HEX_COUNT) {
            lines.push(`      factionId: "${factions[0].id}"`);
        }
    });

    if (rivers.length === 0) {
        lines.push('  rivers: []');
    } else {
        lines.push('  rivers:');
        for (const river of rivers) {
            lines.push(
                `    - id: "${river.id}"`,
                `      name: "${river.name}"`,
                '      nodes:',
            );
            for (const node of river.nodes) {
                lines.push(
                    `        "${node.q},${node.r}":`,
                    `          q: ${node.q}`,
                    `          r: ${node.r}`,
                );
            }

            if (river.nodes.length < 2) {
                lines.push('      edges: []');
                continue;
            }
            lines.push('      edges:');
            for (let i = 0; i < river.nodes.length - 1; i++) {
                const from = river.nodes[i];
                const to = river.nodes[i + 1];
                lines.push(
                    `        - from: "${from.q},${from.r}"`,
                    `          to: "${to.q},${to.r}"`,
                );
            }
        }
    }

    lines.push('  roads: []');

    if (factions.length === 0) {
        lines.push('  factions: []');
    } else {
        lines.push('  factions:');
        for (const faction of factions) {
            lines.push(
                `    - id: "${faction.id}"`,
                `      name: "${faction.name}"`,
                `      color: "${faction.color}"`,
                `      filePath: ${faction.filePath == null ? 'null' : `"${faction.filePath}"`}`,
            );
        }
    }

    lines.push('---', '');
    return lines.join('\n');
}
