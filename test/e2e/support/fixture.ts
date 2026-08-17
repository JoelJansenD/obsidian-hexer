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

// The hexes every Hexer fixture file starts with. Terrain and icon scenarios act
// on these (e.g. "a hex with coloured terrain"), so they stay constant.
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
export function buildHexerFileContent(rivers: SeedRiver[] = []): string {
    const lines: string[] = [
        '---',
        'hexer:',
        `  version: "${CURRENT_VERSION}"`,
        '  size: 50',
        '  hexes:',
    ];

    for (const hex of STANDARD_HEXES) {
        lines.push(
            `    "${hex.q},${hex.r}":`,
            `      q: ${hex.q}`,
            `      r: ${hex.r}`,
            '      terrainColor: "#ff0000"',
            '      icon:',
            '        name: "dungeon-gate"',
            '        color: "#00ff00"',
        );
    }

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

    lines.push('  roads: []', '  factions: []', '---', '');
    return lines.join('\n');
}
