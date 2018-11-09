import { AttributePart, Part, TemplateInstance, TemplatePart, TemplateResult } from '../lit-html.js';
export { html } from '../lit-html.js';
export declare function render(result: TemplateResult, container: Element | DocumentFragment): void;
export declare const extendedPartCallback: (instance: TemplateInstance, templatePart: TemplatePart, node: Node) => Part;
export declare class PropertyPart extends AttributePart {
    setValue(values: any[], startIndex: number): void;
}
export declare class EventPart implements Part {
    instance: TemplateInstance;
    element: Element;
    eventName: string;
    private _listener;
    constructor(instance: TemplateInstance, element: Element, eventName: string);
    setValue(value: any): void;
}
