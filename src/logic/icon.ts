import castle from '../assets/icons/game-icons/castle.svg';
import dungeonGate from '../assets/icons/game-icons/dungeon-gate.svg';
import village from '../assets/icons/game-icons/village.svg';
import medievalVillage from '../assets/icons/game-icons/medieval-village-01.svg';
import peaks from '../assets/icons/game-icons/peaks.svg';
import hills from '../assets/icons/game-icons/hills.svg';
import caveEntrance from '../assets/icons/game-icons/cave-entrance.svg';
import church from '../assets/icons/game-icons/church.svg';

export interface Icon {
    name: string;
    color: string;
}

export const HEXER_ICONS: Map<string, string> = new Map([
    ['castle', castle],
    ['church', church],
    ['village', village],
    ['medieval-village-01', medievalVillage],
    ['peaks', peaks],
    ['hills', hills],
    ['cave-entrance', caveEntrance],
    ['dungeon-gate', dungeonGate]
]);