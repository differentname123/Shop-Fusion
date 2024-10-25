import { JSX } from '../jsx/jsx-namespace';
import { DisplayObject } from '@antv/g-lite';
import Component from '../component';
import { IContext } from '../types';
import { Updater } from '../component/updater';
import Animator from './render/animator';
import { WorkTag } from './workTags';
export interface VNodeLayout {
    width: number;
    height: number;
    left: number;
    top: number;
    right?: number;
    bottom?: number;
}
export interface VNode extends JSX.Element {
    tag: WorkTag;
    component?: Component;
    shape: DisplayObject;
    context: IContext;
    updater: Updater<any>;
    parent: VNode;
    children: VNode | VNode[] | null;
    layout: VNodeLayout;
    style: any;
    animate: boolean;
    animator: Animator;
    transform?: VNode;
}
