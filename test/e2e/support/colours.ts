const COLOUR_HEX: Record<string, string> = {
    red: '#ff0000',
    orange: '#ffa500',
    yellow: '#ffff00',
    green: '#008000',
    blue: '#0000ff',
    indigo: '#4b0082',
    violet: '#ee82ee',
    black: '#000000',
    white: '#ffffff',
};

export function colourToHex(colour: string): string {
    const hex = COLOUR_HEX[colour.toLowerCase()];
    if (!hex) {
        throw new Error(`Unknown colour "${colour}" — add it to COLOUR_HEX in colours.ts`);
    }
    return hex;
}
