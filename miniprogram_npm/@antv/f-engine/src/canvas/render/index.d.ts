import Component from '../../component';
import { VNode } from '../vnode';
import { computeLayout } from './computeLayout';
declare function destroyElement(vNode: VNode | VNode[] | null): void;
declare function renderChildren(parent: VNode, nextChildren: VNode | VNode[] | null, lastChildren: VNode | VNode[] | null): VNode | VNode[];
declare function render(vNode: VNode): void;
declare function updateComponents(components: Component[]): void;
declare function getUpdateAnimation(component: any, newChildren: any, keyFrame: any): false | {
    animators: any[];
    time: number;
};
export { render, renderChildren, updateComponents, computeLayout, destroyElement, getUpdateAnimation, };
