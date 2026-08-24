import BucketStrategy from "./BucketStrategy";
import createHexerData from "../../__test/createHexerData";
import { HexMap } from "../HexerData";
import { Hexagon } from "../hexagon";
import { hexFieldLayerCases, makeHex } from "../../__test/hexFieldLayerCases";

describe.each(hexFieldLayerCases)('BucketStrategy on the $name layer', ({ descriptor, valueA, valueB, valueC, stateWith }) => {
    const onLeftClick = () => new BucketStrategy(descriptor).getEvents().onLeftClick!;

    const withValue = (q: number, r: number, value: unknown): Hexagon => {
        const hex = makeHex(q, r);
        descriptor.write(hex, value);
        return hex;
    };

    it('fills the connected region sharing the clicked value, and nothing else', () => {
        // A connected chain and branch of valueA hexes, a valueC neighbour that
        // must not be filled, and a disconnected valueA hex that must not be filled.
        const hexMap: HexMap = new Map();
        for (const [q, r] of [[0, 0], [1, 0], [2, 0], [3, 0], [1, -1]]) {
            hexMap.set(`${q},${r}`, withValue(q, r, valueA));
        }
        hexMap.set('2,-1', withValue(2, -1, valueC));
        hexMap.set('10,10', withValue(10, 10, valueA));
        const data = createHexerData({ hexes: hexMap });

        onLeftClick()(data, stateWith(valueB), { q: 0, r: 0 });

        for (const key of ['0,0', '1,0', '2,0', '3,0', '1,-1']) {
            expect(descriptor.equals(descriptor.read(hexMap.get(key)!), valueB)).toBe(true);
        }
        expect(descriptor.equals(descriptor.read(hexMap.get('2,-1')!), valueC)).toBe(true);
        expect(descriptor.equals(descriptor.read(hexMap.get('10,10')!), valueA)).toBe(true);
    });

    it('fills a connected region sharing an empty value', () => {
        const hexMap: HexMap = new Map();
        hexMap.set('0,0', makeHex(0, 0));
        hexMap.set('1,0', makeHex(1, 0));
        const data = createHexerData({ hexes: hexMap });

        onLeftClick()(data, stateWith(valueB), { q: 0, r: 0 });

        expect(descriptor.equals(descriptor.read(hexMap.get('0,0')!), valueB)).toBe(true);
        expect(descriptor.equals(descriptor.read(hexMap.get('1,0')!), valueB)).toBe(true);
    });

    it('does nothing when the clicked hex does not exist', () => {
        const data = createHexerData();

        onLeftClick()(data, stateWith(valueB), { q: 0, r: 0 });

        expect(data.getHex({ q: 0, r: 0 })).toBeUndefined();
    });
});
