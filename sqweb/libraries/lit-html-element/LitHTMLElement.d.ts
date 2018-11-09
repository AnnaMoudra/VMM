import { AttributePart, Part, TemplateInstance, TemplateResult } from "./lit-html.js";
import { PropertyPart } from "./lib/lit-extended.js";
export { html, svg } from "./lit-html.js";
export { repeat } from "./lib/repeat.js";
export declare class LitHTMLElement extends HTMLElement {
    is?: string;
    protected needsRender: boolean;
    constructor();
    protected template: TemplateResult;
    protected render(): TemplateResult | Promise<TemplateResult>;
    protected postRender(): void;
    invalidate(): void;
}
export declare class ExtendedAttributePart extends AttributePart {
    setValue(values: any[], startIndex: number): void;
}
export declare class InputValuePropertyPart extends PropertyPart {
    setValue(values: any[], startIndex: number): void;
}
export declare class SetElementInstancePart implements Part {
    instance: TemplateInstance;
    element: Element;
    callback: Function;
    wasSet: boolean;
    valid: boolean;
    constructor(instance: TemplateInstance, element: Element);
    setValue(value: any): void;
}
export declare function ref<T>(target: T, key: keyof T, cache?: boolean): Reference<T>;
export declare class Reference<T> {
    target: T;
    key: keyof T;
    constructor(target: T, key: keyof T);
    prop: T[keyof T];
}
export declare function customElement(tagname?: string): (clazz: any) => void;
export declare function property<T>(reflectToAttribute?: boolean): (proto: LitHTMLElement, propName: string) => any;
