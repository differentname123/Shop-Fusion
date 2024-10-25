import { ShapeProps } from '@antv/f-engine';
import { ZoomProps } from '../zoom';
import { ChartChildProps } from '../../chart';
export interface ScrollBarProps extends ZoomProps {
    /**
     * 显示滚动条
     */
    visible?: boolean;
    /**
     * 滚动条显示位置
     */
    position?: 'bottom' | 'top' | 'left' | 'right';
    /**
     * 间距
     * @deprecated
     */
    margin?: string;
    /**
     * 滚动条父容器样式
     */
    style?: ShapeProps;
    /**
     * 背景条样式
     */
    background?: ShapeProps;
    /**
     * 滚动条样式
     */
    barStyle?: ShapeProps;
}
declare const _default: (View: any) => {
    new (props: ScrollBarProps & ChartChildProps<import("../../chart/Data").DataRecord>): {
        willMount(): any;
        render(): import("@antv/f-engine").JSX.Element;
        startRange: {
            x?: import("../zoom").ZoomRange;
            y?: import("../zoom").ZoomRange;
        };
        scale: {};
        originScale: {};
        minScale: number;
        dims: String[];
        swipeEnd: {
            startX: number;
            startY: number;
            endX: number;
            endY: number;
        };
        loop: number;
        didMount(): void;
        willReceiveProps(nextProps: ScrollBarProps & ChartChildProps<import("../../chart/Data").DataRecord>): void;
        willUpdate(): void;
        didUnmount(): void;
        _requestAnimationFrame(calllback: Function): number;
        _cancelAnimationFrame(): void;
        onPanStart: () => void;
        onPan: (ev: any) => void;
        onPanEnd: () => void;
        onPinchStart: () => void;
        onPinch: (ev: any) => void;
        onPinchEnd: () => void;
        _bindEvents(): void;
        _unBindEvents(): void;
        onStart: () => void;
        update(): void;
        animateSwipe(dim: string, dimRange: import("../zoom").ZoomRange, velocity: number): void;
        onSwipe: (ev: any) => void;
        onEnd: () => void;
        _doXPan(ev: any): import("../zoom").ZoomRange;
        _doYPan(ev: any): import("../zoom").ZoomRange;
        _doPan(ratio: number, dim: string): import("../zoom").ZoomRange;
        _doXPinch(ev: any): any;
        _doYPinch(ev: any): any;
        _doPinch(startRatio: number, endRatio: number, zoom: number, dim: string): any;
        updateRange(originalRange: import("../zoom").ZoomRange, dim: any): import("../zoom").ZoomRange;
        updateFollow(scales: import("../..").Scale[], mainScale: import("../..").Scale, data: any[]): void;
        _getScale(dim: any): any;
        _getFollowScales(dim: any): any[];
        renderRange(range: any): void;
        props: ScrollBarProps & ChartChildProps<import("../../chart/Data").DataRecord>;
        state: import("../zoom").ZoomState;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: import("@antv/f-engine/es/component").default<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        updater: import("@antv/f-engine/es/component/updater").Updater<import("../zoom").ZoomState>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode;
        shouldUpdate(_nextProps: ScrollBarProps & ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        didUpdate(): void;
        willUnmount(): void;
        setState(partialState: import("../zoom").ZoomState, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void;
    };
};
export default _default;
