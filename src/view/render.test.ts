import { defaultCamera } from "../logic/camera";
import { Hexagon } from "../logic/hexagon";
import { hexToPoint } from "../logic/HexerData";
import { defaultMapSettings } from "../logic/mapSettings";
import createHexerData from "../__test/createHexerData";
import { planCoordinateLabels } from "./render";

// A hex with terrain so it counts as non-empty and earns a coordinate label.
const filledHex = (q: number, r: number): Hexagon => ({
    q, r, terrainColor: '#ff0000', icon: null, factionId: null,
});

// The zoom at which a size-50 hex's label sits exactly on the 8px cutoff is
// 8 / (50 * 0.28) ≈ 0.571, so zoom 1 clears it comfortably and zoom 0.4 does not.

describe('planCoordinateLabels', () => {
    it('labels each non-empty hex with its coordinate text when coordinates are on', () => {
        // Arrange - pointy-top so the label is the raw axial pair; this test is
        // about which hexes get a label, not how flat-top re-indexes the text.
        const data = createHexerData({
            hexes: { '0,0': filledHex(0, 0), '2,-1': filledHex(2, -1) },
            mapSettings: { ...defaultMapSettings(), hexOrientation: 'pointy-top', displayCoordinates: true },
        });

        // Act
        const labels = planCoordinateLabels(data);

        // Assert
        expect(labels.map(label => label.text).sort()).toEqual(['0,0', '2,-1']);
    });

    it('labels flat-top hexes with odd-q offset coordinates so rows read horizontally', () => {
        // Arrange - flat-top axial q,r walks a row diagonally; the label re-indexes
        // it to odd-q offset. 3,0 -> row 0 + (3 - 1) / 2 = 1; 2,-1 -> row -1 + 1 = 0.
        const data = createHexerData({
            hexes: { '0,0': filledHex(0, 0), '2,-1': filledHex(2, -1), '3,0': filledHex(3, 0) },
            mapSettings: { ...defaultMapSettings(), hexOrientation: 'flat-top', displayCoordinates: true },
        });

        // Act
        const labels = planCoordinateLabels(data);

        // Assert
        expect(labels.map(label => label.text).sort()).toEqual(['0,0', '2,0', '3,1']);
    });

    it('places each label below the centre of its hex, clear of the icon', () => {
        // Arrange
        const data = createHexerData({
            hexes: { '2,-1': filledHex(2, -1) },
            mapSettings: { ...defaultMapSettings(), displayCoordinates: true },
        });

        // Act
        const [label] = planCoordinateLabels(data);

        // Assert
        const center = hexToPoint(data, { q: 2, r: -1 });
        expect(label.position.x).toBe(center.x);
        expect(label.position.y).toBeGreaterThan(center.y);
    });

    it('skips empty hexes even when they exist in the map', () => {
        // Arrange
        const data = createHexerData({
            hexes: {
                '0,0': filledHex(0, 0),
                '1,0': { q: 1, r: 0, terrainColor: null, icon: null, factionId: null },
            },
            mapSettings: { ...defaultMapSettings(), displayCoordinates: true },
        });

        // Act
        const labels = planCoordinateLabels(data);

        // Assert
        expect(labels.map(label => label.text)).toEqual(['0,0']);
    });

    it('draws nothing when coordinates are toggled off', () => {
        // Arrange
        const data = createHexerData({
            hexes: { '0,0': filledHex(0, 0) },
            mapSettings: { ...defaultMapSettings(), displayCoordinates: false },
        });

        // Act & Assert
        expect(planCoordinateLabels(data)).toEqual([]);
    });

    it('draws labels above the zoom cutoff and hides them below it', () => {
        // Arrange
        const hexes = { '0,0': filledHex(0, 0) };
        const mapSettings = { ...defaultMapSettings(), displayCoordinates: true };

        const zoomedIn = createHexerData({ hexes, mapSettings, camera: { ...defaultCamera(), zoom: 1 } });
        const zoomedOut = createHexerData({ hexes, mapSettings, camera: { ...defaultCamera(), zoom: 0.4 } });
        const backIn = createHexerData({ hexes, mapSettings, camera: { ...defaultCamera(), zoom: 1 } });

        // Act & Assert - hard cutoff: on above the threshold, off below, back on again.
        expect(planCoordinateLabels(zoomedIn)).toHaveLength(1);
        expect(planCoordinateLabels(zoomedOut)).toHaveLength(0);
        expect(planCoordinateLabels(backIn)).toHaveLength(1);
    });
});
