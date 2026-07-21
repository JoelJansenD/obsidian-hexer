import castle from '../assets/icons/game-icons/castle.svg';
import dungeonGate from '../assets/icons/game-icons/dungeon-gate.svg';

export interface Icon {
    name: string;
    color: string;
}

export const HEXER_ICONS: Map<string, string> = new Map([
    ['castle', castle],
    ['dungeon-gate', dungeonGate]
]);