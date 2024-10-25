import { JSX } from '../jsx/jsx-namespace';
import { IProps, IState } from '../types/jsx';
import { Group } from '@antv/g-lite';
import { IContext, LayoutProps } from '../types';
import { Updater } from './updater';
import { VNode } from '../canvas/vnode';
import Animator from '../canvas/render/animator';
export interface Props extends IProps {
    zIndex?: number;
}
declare class Component<P extends Props = IProps, S = IState> {
    props: P;
    state: S;
    context: IContext;
    refs: {
        [key: string]: Component;
    };
    updater: Updater<S>;
    container: Group;
    layout: LayoutProps;
    children: VNode | VNode[] | null;
    isMounted: boolean;
    animate: boolean;
    animator: Animator;
    destroyed: boolean;
    _vNode: VNode;
    constructor(props: P, context?: IContext, updater?: Updater<S>);
    willMount(): void;
    didMount(): void;
    shouldUpdate(_nextProps: P): boolean;
    willReceiveProps(_props: P, _context?: IContext): void;
    willUpdate(): void;
    didUpdate(): void;
    render(): JSX.Element | null;
    willUnmount(): void;
    didUnmount(): void;
    setState(partialState: S, callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    setAnimate(animate: boolean): void;
    destroy(): void;
}
export default Component;
