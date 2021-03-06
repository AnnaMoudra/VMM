import { DirectiveFn } from '../lit-html.js';
export declare type KeyFn<T> = (item: T) => any;
export declare type ItemTemplate<T> = (item: T, index: number) => any;
export declare function repeat<T>(items: T[], keyFn: KeyFn<T>, template: ItemTemplate<T>): DirectiveFn;
export declare function repeat<T>(items: T[], template: ItemTemplate<T>): DirectiveFn;
