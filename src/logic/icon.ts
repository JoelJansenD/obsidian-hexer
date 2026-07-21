import castle from '../assets/icons/game-icons/castle.svg';

export interface Icon {
    name: string;
    color: string;
}

export const HEXER_ICONS: Record<string, string> = {
    castle,
};