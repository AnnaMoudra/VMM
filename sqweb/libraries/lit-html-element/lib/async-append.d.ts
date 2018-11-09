import { NodePart } from '../lit-html.js';
export declare const asyncAppend: <T>(value: AsyncIterable<T>, mapper?: (v: T, index?: number) => any) => (part: NodePart) => Promise<void>;
