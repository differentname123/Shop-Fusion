import { JSX as JSXNamespace } from './jsx-namespace';
import { ElementType } from '../types';
export declare namespace jsx {
    namespace JSX {
        type Element = JSXNamespace.Element;
        type ElementClass = JSXNamespace.ElementClass;
        type IntrinsicElements = JSXNamespace.IntrinsicElements;
        type ElementAttributesProperty = JSXNamespace.ElementAttributesProperty;
        type ElementChildrenAttribute = JSXNamespace.ElementChildrenAttribute;
        type IntrinsicAttributes = JSXNamespace.IntrinsicAttributes;
        type IntrinsicClassAttributes = JSXNamespace.IntrinsicClassAttributes;
    }
}
export declare function jsx(type: ElementType, config: any, ...children: any[]): JSXNamespace.Element;
