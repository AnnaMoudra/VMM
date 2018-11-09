export declare const html: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;
export declare const svg: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;
export declare class TemplateResult {
    template: Template;
    values: any[];
    constructor(template: Template, values: any[]);
}
export declare function render(result: TemplateResult, container: Element | DocumentFragment, partCallback?: PartCallback): void;
export declare class TemplatePart {
    type: string;
    index: number;
    name: string;
    rawName: string;
    strings: string[];
    constructor(type: string, index: number, name?: string, rawName?: string, strings?: string[]);
}
export declare class Template {
    parts: TemplatePart[];
    element: HTMLTemplateElement;
    constructor(strings: TemplateStringsArray, svg?: boolean);
    private _getHtml(strings, svg?);
}
export declare const getValue: (part: Part, value: any) => any;
export declare type DirectiveFn<P extends Part = Part> = (part: P) => any;
export declare const directive: <P extends Part = Part, F = DirectiveFn<P>>(f: F) => F;
export interface Part {
    instance: TemplateInstance;
    size?: number;
}
export interface SinglePart extends Part {
    setValue(value: any): void;
}
export interface MultiPart extends Part {
    setValue(values: any[], startIndex: number): void;
}
export declare class AttributePart implements MultiPart {
    instance: TemplateInstance;
    element: Element;
    name: string;
    strings: string[];
    size: number;
    constructor(instance: TemplateInstance, element: Element, name: string, strings: string[]);
    protected _interpolate(values: any[], startIndex: number): string;
    setValue(values: any[], startIndex: number): void;
}
export declare class NodePart implements SinglePart {
    instance: TemplateInstance;
    startNode: Node;
    endNode: Node;
    _previousValue: any;
    constructor(instance: TemplateInstance, startNode: Node, endNode: Node);
    setValue(value: any): void;
    private _insert(node);
    private _setNode(value);
    private _setText(value);
    private _setTemplateResult(value);
    private _setIterable(value);
    private _setPromise(value);
    clear(startNode?: Node): void;
}
export declare type PartCallback = (instance: TemplateInstance, templatePart: TemplatePart, node: Node) => Part;
export declare const defaultPartCallback: (instance: TemplateInstance, templatePart: TemplatePart, node: Node) => Part;
export declare class TemplateInstance {
    _parts: Part[];
    _partCallback: PartCallback;
    template: Template;
    constructor(template: Template, partCallback?: PartCallback);
    update(values: any[]): void;
    _clone(): DocumentFragment;
}
export declare const reparentNodes: (container: Node, start: Node, end?: Node, before?: Node) => void;
export declare const removeNodes: (container: Node, startNode: Node, endNode?: Node) => void;
