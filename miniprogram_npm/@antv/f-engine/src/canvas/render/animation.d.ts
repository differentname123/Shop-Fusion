import { VNode } from '../vnode';
import Animator from './animator';
import { playerFrame } from '../../playerFrames';
declare function createAnimation(parent: VNode, nextChildren: VNode | VNode[], lastChildren: VNode | VNode[]): Animator[];
declare function calAnimationTime(childrenAnimation: Animator[], keyFrame: Record<string, playerFrame>, parentEffect?: any): {
    animators: any[];
    time: number;
};
export { createAnimation, calAnimationTime };
