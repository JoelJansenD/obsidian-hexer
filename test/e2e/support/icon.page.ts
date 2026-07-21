const COLOUR_PICKER_SELECTOR = '[data-hexer-colour-field-target="icon"]';

class IconPage {
    get colourPicker() {
        return browser.$(COLOUR_PICKER_SELECTOR);
    }

    async selectIcon(icon: string) {
        const element = browser.$(`[data-hexer-icon="${icon}"]`);
        await element.waitForExist();
        await element.click();
    }

    async setColour(value: string) {
        await this.colourPicker.waitForExist();

        // A `<input type="color">` doesn't accept typed input, and setting its value
        // programmatically doesn't fire the `input` event the palette listens for,
        // so set the value and dispatch the event manually.
        await browser.execute((selector, colour) => {
            const input = document.querySelector(selector) as HTMLInputElement | null;
            if (!input) return;
            input.value = colour;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, COLOUR_PICKER_SELECTOR, value);
    }
}

export default new IconPage();
