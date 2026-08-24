const COLOR_PICKER_SELECTOR = '[data-hexer-color-field-target="terrain"]';

class TerrainPage {
    get colorPicker() {
        return browser.$(COLOR_PICKER_SELECTOR);
    }

    async setColor(value: string) {
        await this.colorPicker.waitForExist();

        // A `<input type="color">` doesn't accept typed input, and setting its value
        // programmatically doesn't fire the `input` event the palette listens for,
        // so set the value and dispatch the event manually.
        await browser.execute((selector, color) => {
            const input = document.querySelector(selector) as HTMLInputElement | null;
            if (!input) return;
            input.value = color;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, COLOR_PICKER_SELECTOR, value);
    }
}

export default new TerrainPage();
