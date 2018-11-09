import { AttributePart, getValue, render as baseRender } from "./lit-html.js";
import { html, extendedPartCallback as basePartCallback } from "./lib/lit-extended.js";
export { html, svg } from "./lit-html.js";
export { repeat } from "./lib/repeat.js";
export { until } from "./lib/until.js";
export { unsafeHTML } from "./lib/unsafe-html.js";
export class LitHTMLElement extends HTMLElement {
    constructor() {
        super();
        this.needsRender = false;
        this.template = html ` `;
        this.attachShadow({ mode: 'open' });
        this.invalidate();
    }
    render() { return this.template; }
    invalidate() {
        if (!this.needsRender) {
            this.needsRender = true;
            Promise.resolve().then(() => {
                this.needsRender = false;
                baseRender(this.render(), this.shadowRoot, extendedPartCallback);
            });
        }
    }
}
const extendedPartCallback = (instance, templatePart, node) => {
    if (templatePart.type === 'attribute') {
        if (templatePart.name.endsWith('$')) {
            const name = templatePart.name.slice(0, -1);
            return new ExtendedAttributePart(instance, node, name, templatePart.strings);
        }
        else if (templatePart.rawName === "this") {
            return new SetElementInstancePart(instance, node);
        }
    }
    return basePartCallback(instance, templatePart, node);
};
export class ExtendedAttributePart extends AttributePart {
    setValue(values, startIndex) {
        const s = this.strings;
        if (s.length == 2 && s[0] == "" && s[1] == "") {
            const v = values[startIndex];
            if (v === false || v === null || v === undefined) {
                this.element.removeAttribute(this.name);
                return;
            }
            else if (v === true) {
                this.element.setAttribute(this.name, "");
                return;
            }
        }
        super.setValue(values, startIndex);
    }
}
export class SetElementInstancePart {
    constructor(instance, element) {
        this.wasSet = false;
        this.valid = false;
        this.instance = instance;
        this.element = element;
    }
    setValue(value) {
        if (!this.wasSet) {
            this.callback = getValue(this, value);
            this.wasSet = true;
            this.valid = this.callback && typeof this.callback === 'function';
        }
        if (this.valid) {
            this.callback(this.element);
        }
    }
}
export function customElement(tagname) {
    return (clazz) => {
        clazz.is = clazz.is || tagname || clazz.name.replace(/([a-z])([A-Z]+[a-z])/g, '$1-$2').toLowerCase();
        window.customElements.define(clazz.is, clazz);
    };
}
export function property(reflectToAttribute) {
    return (proto, propName) => {
        if (reflectToAttribute)
            throw new Error("reflectToAttribute is not yet implemented!");
        const key = "__" + propName;
        Object.defineProperty(proto, propName, {
            get() { return this[key]; },
            set(value) { this[key] = value; this.invalidate(); }
        });
    };
}
//# sourceMappingURL=LitHTMLElement.js.map