import { AttributePart, TemplateResult, getValue, render as baseRender } from "./lit-html.js";
import { html, extendedPartCallback as basePartCallback, PropertyPart } from "./lib/lit-extended.js";
export { html, svg } from "./lit-html.js";
export { repeat } from "./lib/repeat.js";
export class LitHTMLElement extends HTMLElement {
    constructor() {
        super();
        this.needsRender = false;
        this.template = html ` `;
        this.attachShadow({ mode: 'open' });
        this.invalidate();
    }
    render() { return this.template; }
    postRender() { }
    invalidate() {
        if (!this.needsRender) {
            this.needsRender = true;
            Promise.resolve().then(() => {
                this.needsRender = false;
                const tr = this.render();
                if (tr instanceof TemplateResult) {
                    baseRender(tr, this.shadowRoot, extendedPartCallback);
                    this.postRender();
                }
                else {
                    tr.then(tr => {
                        baseRender(tr, this.shadowRoot, extendedPartCallback);
                        this.postRender();
                    });
                }
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
        else if (templatePart.name === "this") {
            return new SetElementInstancePart(instance, node);
        }
        else if (templatePart.name === "value" || templatePart.name === "selected-index") {
            return new InputValuePropertyPart(instance, node, templatePart.rawName, templatePart.strings);
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
        super.setValue.call(this, values, startIndex);
    }
}
export class InputValuePropertyPart extends PropertyPart {
    setValue(values, startIndex) {
        const s = this.strings;
        let value;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            value = getValue(this, values[startIndex]);
            if (value instanceof Reference && (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement || this.element instanceof HTMLTextAreaElement)) {
                if (this.name == "value") {
                    this.element.value = value.prop;
                    if (!this.element["__value"]) {
                        this.element.addEventListener("input", e => e.target["__value"].prop = e.target["value"]);
                    }
                    this.element["__value"] = value;
                    return;
                }
                else if (this.name == "selected-index" && this.element instanceof HTMLSelectElement) {
                    this.element.selectedIndex = value.prop;
                    if (!this.element["__selectedIndex"]) {
                        this.element.addEventListener("input", e => e.target["__selectedIndex"].prop = e.target["selectedIndex"]);
                    }
                    this.element["__selectedIndex"] = value;
                    return;
                }
            }
        }
        super.setValue.call(this, values, startIndex);
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
const keyMapCache = new WeakMap();
export function ref(target, key, cache) {
    if (!cache)
        return new Reference(target, key);
    let keyMap = keyMapCache.get(target);
    if (keyMap === undefined) {
        keyMap = new Map();
        keyMapCache.set(target, keyMap);
    }
    let r = keyMap.get(key);
    if (r === undefined) {
        r = new Reference(target, key);
        keyMap.set(key, r);
    }
    return r;
}
export class Reference {
    constructor(target, key) {
        this.target = target;
        this.key = key;
    }
    get prop() {
        return this.target[this.key];
    }
    set prop(val) {
        this.target[this.key] = val;
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
            set(value) { if (this[key] !== value) {
                this[key] = value;
                this.invalidate();
            } }
        });
    };
}
//# sourceMappingURL=LitHTMLElement.js.map