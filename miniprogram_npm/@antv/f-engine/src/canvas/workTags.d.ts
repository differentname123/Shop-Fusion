import { ElementType } from '../types';
export type WorkTag = 0 | 1 | 2;
export declare const FunctionComponent = 0;
export declare const ClassComponent = 1;
export declare const Shape = 2;
export declare function getWorkTag(type: ElementType): WorkTag;
