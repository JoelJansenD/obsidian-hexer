// Drives a colour palette: the 2x5 grid of quick-switch swatches beside a
// layer's colour picker. `target` names the layer the palette belongs to
// (e.g. "terrain"), mirroring the colour picker's data-hexer-colour-field-target.
class PalettePage {
    private swatchSelector(target: string, index: number) {
        return `[data-hexer-palette-target="${target}"] [data-hexer-swatch="${index}"]`;
    }

    private overrideSelector(target: string, index: number) {
        return `[data-hexer-palette-target="${target}"] input[data-hexer-swatch-override="${index}"]`;
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

    async overrideSwatch(target: string, index: number, value: string) {
        const selector = this.overrideSelector(target, index);
        await browser.$(selector).waitForExist();

        // A `<input type="color">` ignores typed input, and setting its value
        // programmatically doesn't fire the `input` event the palette listens for,
        // so set the value and dispatch the event manually — mirroring
        // terrainPage.setColour.
        await browser.execute((sel, colour) => {
            const input = document.querySelector(sel) as HTMLInputElement | null;
            if (!input) return;
            input.value = colour;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, selector, value);
    }
}

export default new PalettePage();
