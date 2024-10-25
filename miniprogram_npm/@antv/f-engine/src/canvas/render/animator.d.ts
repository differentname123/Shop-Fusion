import { DisplayObject, IAnimation } from '@antv/g-lite';
import EE from 'eventemitter3';
import { VNode } from '../vnode';
declare class Animator extends EE {
    vNode: VNode;
    shape: DisplayObject;
    start: any;
    end: any;
    effect: any;
    animations: IAnimation[];
    children: Animator[];
    constructor();
    animate(shape: any, start: any, end: any, effect: any): void;
    run(): IAnimation[];
    play(): void;
    pause(): void;
    goTo(frame: number): void;
    finish(): void;
    setPlaybackRate(speed: any): void;
    endEmit(animations: IAnimation[]): any;
    reset(shape: DisplayObject): void;
    clone(): Animator;
}
export default Animator;
