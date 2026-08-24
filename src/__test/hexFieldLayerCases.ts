import { EditorState } from "../logic/EditorState";
import { Hexagon } from "../logic/hexagon";
import {
    factionLayerDescriptor,
    HexFieldLayerDescriptor,
    iconLayerDescriptor,
    terrainLayerDescriptor,
} from "../logic/toolStrategies/hexFieldLayers";
import defaultEditorState from "./defaultEditorState";

/**
 * Drives the generic Brush/Bucket/Eraser tests once per hex-field layer, so the
 * per-layer behaviour that used to live in nine separate strategy test files is
 * exercised through the collapsed strategies. `T` is erased to `any` because the
 * cases carry mixed value types (string, Icon) in one array.
 */
export interface HexFieldLayerCase {
    /** Layer name, used in the test titles. */
    name: string;
    descriptor: HexFieldLayerDescriptor<any>;
    /**
     * Three mutually distinct values for this layer. For the icon layer `valueA`
     * and `valueC` deliberately share a name but differ in colour, so a bucket
     * fill that treats them as equal is caught.
     */
    valueA: any;
    valueB: any;
    valueC: any;
    /** An editor state whose active value for this layer is `value`. */
    stateWith(value: any): EditorState;
}

/** Builds a hex with the given coordinates, empty on every layer unless overridden. */
export const makeHex = (q: number, r: number, overrides: Partial<Hexagon> = {}): Hexagon => ({
    q, r, terrainColor: null, icon: null, factionId: null, ...overrides,
});

const terrainCase: HexFieldLayerCase = {
    name: 'terrain',
    descriptor: terrainLayerDescriptor,
    valueA: '#ff0000',
    valueB: '#00ff00',
    valueC: '#0000ff',
    stateWith: value => ({ ...defaultEditorState, activeColor: value }),
};

const factionCase: HexFieldLayerCase = {
    name: 'faction',
    descriptor: factionLayerDescriptor,
    valueA: 'faction-a',
    valueB: 'faction-b',
    valueC: 'faction-c',
    stateWith: value => ({ ...defaultEditorState, activeFactionId: value }),
};

const iconCase: HexFieldLayerCase = {
    name: 'icon',
    descriptor: iconLayerDescriptor,
    valueA: { name: 'castle', color: '#ff0000' },
    valueB: { name: 'dungeon-gate', color: '#0000ff' },
    valueC: { name: 'castle', color: '#00ff00' },
    stateWith: value => ({ ...defaultEditorState, activeIcon: value }),
};

export const hexFieldLayerCases: HexFieldLayerCase[] = [terrainCase, factionCase, iconCase];
