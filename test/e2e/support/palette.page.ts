// Drives a colour palette: the 2x5 grid of quick-switch swatches beside a
// layer's colour picker. `target` names the layer the palette belongs to
// (e.g. "terrain"), mirroring the colour picker's data-hexer-colour-field-target.
class PalettePage {
    private swatchSelector(target: string, index: number) {
        return `[data-hexer-palette-target="${target}"] [data-hexer-swatch="${index}"]`;
    }

    swatch(target: string, index: number) {
        return browser.$(this.swatchSelector(target, index));
    }

    async selectSwatch(target: string, index: number) {
        const element = this.swatch(target, index);
        await element.waitForClickable();
        await element.click();
    }

    async swatchColour(target: string, index: number): Promise<string> {
        const element = this.swatch(target, index);
        await element.waitForExist();
        const colour = await element.getAttribute('data-hexer-swatch-colour');
        return (colour ?? '').toLowerCase();
    }

    async overrideSwatch(target: string, index: number) {
        const selector = this.swatchSelector(target, index);
        await browser.$(selector).waitForExist();

        // Right-clicking copies the active colour into the swatch. Dispatch the
        // contextmenu event the palette listens for directly, mirroring how the
        // colour picker's input event is dispatched in terrainPage.setColour.
        await browser.execute((sel) => {
            const element = document.querySelector(sel) as HTMLElement | null;
            element?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        }, selector);
    }
}

export default new PalettePage();
