import { AttributePart, Part, TemplateInstance, TemplatePart, TemplateResult, getValue, render as baseRender, directive, DirectiveFn, NodePart } from "./lit-html.js";
import { html, render, extendedPartCallback as basePartCallback, PropertyPart } from "./lib/lit-extended.js"
export { html, svg } from "./lit-html.js";
export { repeat } from "./lib/repeat.js";
//export { until } from "./lib/until.js";
//export { unsafeHTML } from "./lib/unsafe-html.js";

export class LitHTMLElement extends HTMLElement {
    
    public is?: string;

    protected needsRender: boolean = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.invalidate();
    }

    protected template = html` `;

    protected render(): TemplateResult | Promise<TemplateResult> { return this.template; }
    protected postRender() {}

    invalidate(/*now = false*/) {
        // if (now) {
        //     baseRender(this.render(), this.shadowRoot, extendedPartCallback);
        //     return;
        // }
        if (!this.needsRender) {
            this.needsRender = true;
            Promise.resolve().then(() => {
                this.needsRender = false;
                const tr = this.render();
                if (tr instanceof TemplateResult) {
                    baseRender(tr, this.shadowRoot, extendedPartCallback);
                    this.postRender();
                } else {
                    tr.then(tr => {
                        baseRender(tr, this.shadowRoot, extendedPartCallback);
                        this.postRender();
                    });
                }
            });
        }
    }
}

const extendedPartCallback = (instance: TemplateInstance, templatePart: TemplatePart, node: Node): Part => {
        if (templatePart.type === 'attribute') {
            if (templatePart.name!.endsWith('$')) {
                const name = templatePart.name!.slice(0, -1);
                return new ExtendedAttributePart(instance, node as Element, name, templatePart.strings!);
            } else if (templatePart.name! === "this") {
                return new SetElementInstancePart(instance, node as Element);
            } else if (templatePart.name! === "value" || templatePart.name! === "selected-index") {
                return new InputValuePropertyPart(instance, node as Element, templatePart.rawName!, templatePart.strings!);
            }
        }
        return basePartCallback(instance, templatePart, node);
    };

export class ExtendedAttributePart extends AttributePart {
    setValue(values: any[], startIndex: number): void {
        const s = this.strings;
        if (s.length == 2 && s[0] == "" && s[1] == "") {
            const v = values[startIndex];
            if (v === false || v === null || v === undefined) {
                this.element.removeAttribute(this.name);
                return;
            } else if (v === true) {
                this.element.setAttribute(this.name, "");
                return;
            }
        } 
        super.setValue.call(this, values, startIndex);
        //AttributePart.prototype.setValue.call(this, values, startIndex);
        //super.setValue(values, startIndex);
    }
}

export class InputValuePropertyPart extends PropertyPart {
    setValue(values: any[], startIndex: number): void {
        const s = this.strings;
        let value: any;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = getValue(this, values[startIndex]);
            if (value instanceof Reference && (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement || this.element instanceof HTMLTextAreaElement)) {
                //(this.element as HTMLInputElement)[this.name] = value.prop;
                if (this.name == "value") {
                    this.element.value = value.prop;
                    if (!this.element["__value"]) {
                        this.element.addEventListener("input", e => e.target["__value"].prop = e.target["value"]);
                    }
                    this.element["__value"] = value;
                    return;
                } else if (this.name == "selected-index" && this.element instanceof HTMLSelectElement) {
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
        //(this.element as any)[this.name] = value;
    }
}

export class SetElementInstancePart implements Part {
    instance: TemplateInstance;
    element: Element;
    callback: Function;
    wasSet = false;
    valid = false;
    
    constructor(instance: TemplateInstance, element: Element) {
        this.instance = instance;
        this.element = element;
    }
    
    setValue(value: any): void {
        if (!this.wasSet) {
            this.callback = getValue(this, value);
            this.wasSet = true;
            //console.log("SET CALLBACK");
            this.valid = this.callback && typeof this.callback=== 'function';
        }
        if (this.valid) {
            this.callback(this.element);
        }
    }
}
const keyMapCache = new WeakMap<any, Map<any, Reference<any>>>();

export function ref<T>(target: T, key: keyof T, cache?: boolean): Reference<T> {
    if (!cache) return new Reference(target, key); // Does not make sense to cache reference if the the target is different in every render
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

export class Reference<T> {
    target: T;
    key: keyof T;
    constructor(target: T, key: keyof T) {
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

export function customElement(tagname?: string) {
    return (clazz: any) => {
      clazz.is = clazz.is || tagname || (clazz.name as string).replace(/([a-z])([A-Z]+[a-z])/g, '$1-$2').toLowerCase();
      window.customElements.define(clazz.is, clazz);
    }
  }

export function property<T>(reflectToAttribute?: boolean) {
    return (proto: LitHTMLElement, propName: string) : any => {
        if (reflectToAttribute) throw new Error("reflectToAttribute is not yet implemented!");
        const key = "__" + propName;
        //let prev = undefined;
        // if (propName == "narrow") {
        //     //prev = proto[propName];
        //     //delete proto[propName];
        //     console.log(proto);
        // }
        // const r = Reflect.defineProperty(proto, propName, {
        //     get() { return this[key]; },
        //     set(value) { if (this[key] !== value) { this[key] = value; this.invalidate(); } }
        // });
        // if (propName == "narrow") {
        //     console.log(r, proto);
        // }
        Object.defineProperty(proto, propName, {
            get() { return this[key]; },
            set(value) { if (this[key] !== value) { this[key] = value; this.invalidate(); } }
        });
        //if (prev) proto[propName] = prev;
    }
}