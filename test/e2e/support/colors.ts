const COLOR_HEX: Record<string, string> = {
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

export function colorToHex(color: string): string {
    const hex = COLOR_HEX[color.toLowerCase()];
    if (!hex) {
        throw new Error(`Unknown color "${color}" — add it to COLOR_HEX in colors.ts`);
    }
    return hex;
}
