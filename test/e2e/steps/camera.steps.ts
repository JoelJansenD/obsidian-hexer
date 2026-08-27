import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import cameraPage from '../support/camera.page';
import { CameraContext } from '../support/contexts/camera.context';

// A pixel tolerance for screen-position assertions, absorbing pointer rounding
// and subpixel drift through the zoom.
const PIXEL_TOLERANCE = 3;

// A standard painted hex from the fixture, used as the reference point whose
// on-screen movement reveals what the camera did.
const REFERENCE_HEX = { q: 1, r: 1 };

Given('the map has hexes and a river spread across a wide area', async function () {
    await cameraPage.seedWideContent();
});

When('I drag the middle mouse button {int} px right and {int} px down', async function (this: CameraContext, dx: number, dy: number) {
    this.referenceHex = REFERENCE_HEX;
    this.referenceScreenPoint = await cameraPage.hexScreenOffset(REFERENCE_HEX);
    await cameraPage.spyOnSaveRequests();

    await cameraPage.middleDrag(dx, dy);
});

When('I scroll the wheel up one notch over a painted hex', async function (this: CameraContext) {
    this.referenceHex = REFERENCE_HEX;
    this.cameraBeforeGesture = await cameraPage.getCamera();
    this.referenceScreenPoint = await cameraPage.hexScreenOffset(REFERENCE_HEX);
    await cameraPage.spyOnSaveRequests();

    // A negative wheel delta scrolls up, which zooms in one notch.
    await cameraPage.wheelOverHex(REFERENCE_HEX, -100);
});

When('I click the zoom to fit button on the action bar', async function () {
    await cameraPage.spyOnSaveRequests();
    await cameraPage.clickZoomToFit();
});

Then('the whole scene shifts right and down by {int},{int}', async function (this: CameraContext, dx: number, dy: number) {
    expect(this.referenceScreenPoint).toBeDefined();
    const after = await cameraPage.hexScreenOffset(this.referenceHex!);

    expect(Math.abs(after.x - this.referenceScreenPoint!.x - dx)).toBeLessThanOrEqual(PIXEL_TOLERANCE);
    expect(Math.abs(after.y - this.referenceScreenPoint!.y - dy)).toBeLessThanOrEqual(PIXEL_TOLERANCE);
});

Then('the zoom increases by a factor of {float}', async function (this: CameraContext, factor: number) {
    expect(this.cameraBeforeGesture).toBeDefined();
    const after = await cameraPage.getCamera();

    expect(after.zoom).toBeCloseTo(this.cameraBeforeGesture!.zoom * factor, 4);
});

Then('that hex stays under the pointer', async function (this: CameraContext) {
    expect(this.referenceScreenPoint).toBeDefined();
    const after = await cameraPage.hexScreenOffset(this.referenceHex!);

    expect(Math.abs(after.x - this.referenceScreenPoint!.x)).toBeLessThanOrEqual(PIXEL_TOLERANCE);
    expect(Math.abs(after.y - this.referenceScreenPoint!.y)).toBeLessThanOrEqual(PIXEL_TOLERANCE);
});

Then('every hex and every path node is visible within the viewport', async function () {
    const { width, height } = await cameraPage.canvasSize();
    const offsets = await cameraPage.allContentScreenOffsets();

    expect(offsets.length).toBeGreaterThan(0);
    for (const offset of offsets) {
        expect(Math.abs(offset.x)).toBeLessThanOrEqual(width / 2);
        expect(Math.abs(offset.y)).toBeLessThanOrEqual(height / 2);
    }
});

Then('no undo entry is created', async function () {
    expect(await cameraPage.canUndo()).toBe(false);
});

Then('the document is marked dirty', async function () {
    expect(await cameraPage.wasSaveRequested()).toBe(true);
});
