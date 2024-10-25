import { JSX } from './jsx/jsx-namespace';
declare function cloneElement(element: any, props: any): any;
declare function map<T = any>(children: T | T[] | null, fn: (child: T | null) => any): any;
declare function compare<T extends JSX.Element = JSX.Element>(nextElement: T | T[] | null, lastElement: T | T[] | null, callback: (next: T | T[] | null, last: T | T[] | null) => any): any;
declare function toArray<T = any>(element: T | T[] | null): T[] | null;
declare const Children: {
    cloneElement: typeof cloneElement;
    map: typeof map;
    toArray: typeof toArray;
    compare: typeof compare;
};
export default Children;
