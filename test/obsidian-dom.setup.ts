// Polyfills the subset of Obsidian's HTMLElement DOM helpers that the view layer
// relies on. Obsidian injects these onto HTMLElement.prototype at runtime; the
// plain DOM provided by happy-dom does not have them, so we add them here for
// DOM-oriented unit tests. Guarded so this is a no-op under the `node`
// environment used by the logic tests.
if (typeof HTMLElement !== 'undefined') {
    type DomElementInfo = {
        cls?: string | string[];
        text?: string;
        attr?: Record<string, string | number | boolean | null>;
        title?: string;
        value?: string;
        type?: string;
        placeholder?: string;
        href?: string;
        parent?: Node;
        prepend?: boolean;
    };

    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;

    function createEl(
        this: HTMLElement,
        tag: string,
        o?: DomElementInfo | string,
        callback?: (el: HTMLElement) => void,
    ): HTMLElement {
        const el = document.createElement(tag);
        const info: DomElementInfo = typeof o === 'string' ? { cls: o } : (o ?? {});

        if (info.cls) {
            const classes = Array.isArray(info.cls) ? info.cls : info.cls.split(/\s+/);
            el.classList.add(...classes.filter(Boolean));
        }
        if (info.text !== undefined) {
            el.textContent = info.text;
        }
        if (info.attr) {
            for (const [key, val] of Object.entries(info.attr)) {
                if (val === null || val === false) continue;
                el.setAttribute(key, val === true ? '' : String(val));
            }
        }
        if (info.title !== undefined) el.setAttribute('title', info.title);
        if (info.value !== undefined) (el as HTMLInputElement).value = info.value;
        if (info.type !== undefined) el.setAttribute('type', info.type);
        if (info.placeholder !== undefined) el.setAttribute('placeholder', info.placeholder);
        if (info.href !== undefined) el.setAttribute('href', info.href);

        const parent = info.parent ?? this;
        if (info.prepend) {
            parent.insertBefore(el, parent.firstChild);
        } else {
            parent.appendChild(el);
        }

        callback?.(el);
        return el;
    }

    proto.createEl = createEl;

    proto.createDiv = function (this: HTMLElement, o?: DomElementInfo | string, callback?: (el: HTMLElement) => void) {
        return createEl.call(this, 'div', o, callback);
    };

    proto.createSpan = function (this: HTMLElement, o?: DomElementInfo | string, callback?: (el: HTMLElement) => void) {
        return createEl.call(this, 'span', o, callback);
    };

    proto.setText = function (this: HTMLElement, text: string) {
        this.textContent = text;
        return this;
    };

    proto.empty = function (this: HTMLElement) {
        while (this.firstChild) this.removeChild(this.firstChild);
        return this;
    };

    proto.addClass = function (this: HTMLElement, ...classes: string[]) {
        this.classList.add(...classes);
        return this;
    };

    proto.removeClass = function (this: HTMLElement, ...classes: string[]) {
        this.classList.remove(...classes);
        return this;
    };

    proto.toggleClass = function (this: HTMLElement, classes: string | string[], value?: boolean) {
        const list = Array.isArray(classes) ? classes : [classes];
        for (const cls of list) this.classList.toggle(cls, value);
        return this;
    };

    proto.setAttr = function (this: HTMLElement, qualifiedName: string, value: string | number | boolean | null) {
        if (value === null || value === false) {
            this.removeAttribute(qualifiedName);
        } else {
            this.setAttribute(qualifiedName, value === true ? '' : String(value));
        }
        return this;
    };
}
