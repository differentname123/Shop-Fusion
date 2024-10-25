import { Component } from '@antv/f-engine';
import { ChartChildProps } from '../../chart';
import { Scale } from '../../deps/f2-scale/src';
export type ZoomRange = [number, number];
export type ScaleValues = number[] | string[];
export interface ZoomProps {
    panSensitive?: number;
    pinchSensitive?: number;
    /**
     * 缩放和平移模式
     */
    mode?: 'x' | 'y' | ['x', 'y'] | null;
    /**
     * 显示的范围
     */
    range?: ZoomRange;
    /**
     * 平移
     */
    pan?: boolean;
    /**
     * 缩放
     */
    pinch?: boolean;
    /**
     * 横扫
     */
    swipe?: boolean;
    /**
     * 横扫动画时长
     */
    swipeDuration?: number;
    /**
     * 事件回调
     */
    onPanStart?: Function;
    onPinchStart?: Function;
    onPan?: Function;
    onPinch?: Function;
    onPanEnd?: Function;
    onPinchEnd?: Function;
    onInit?: Function;
    onChange?: Function;
    /**
     * 自动同步 x/y 的坐标值
     */
    autoFit?: boolean;
    /**
     * 最少展示数据量，用于控制最小缩放比例, 默认是10
     */
    minCount?: number;
}
export interface ZoomState {
    range: {
        x?: ZoomRange;
        y?: ZoomRange;
    };
}
declare const _default: (View: any) => {
    new <P extends ZoomProps = ZoomProps, S extends ZoomState = ZoomState>(props: P): {
        startRange: {
            x?: ZoomRange;
            y?: ZoomRange;
        };
        scale: {};
        originScale: {};
        minScale: number;
        dims: Array<String>;
        swipeEnd: {
            startX: number;
            startY: number;
            endX: number;
            endY: number;
        };
        loop: number;
        didMount(): void;
        willReceiveProps(nextProps: P): void;
        willMount(): void;
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
        animateSwipe(dim: string, dimRange: ZoomRange, velocity: number): void;
        onSwipe: (ev: any) => void;
        onEnd: () => void;
        _doXPan(ev: any): ZoomRange;
        _doYPan(ev: any): ZoomRange;
        _doPan(ratio: number, dim: string): ZoomRange;
        _doXPinch(ev: any): any;
        _doYPinch(ev: any): any;
        _doPinch(startRatio: number, endRatio: number, zoom: number, dim: string): any;
        updateRange(originalRange: ZoomRange, dim: any): ZoomRange;
        updateFollow(scales: Scale[], mainScale: Scale, data: any[]): void;
        _getScale(dim: any): any;
        _getFollowScales(dim: any): any[];
        renderRange(range: any): void;
        render(): import("@antv/f-engine").JSX.Element;
        props: P & ChartChildProps<import("../../chart/Data").DataRecord>;
        state: S;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: Component<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        updater: import("@antv/f-engine/es/component/updater").Updater<S>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode;
        shouldUpdate(_nextProps: P & ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        didUpdate(): void;
        willUnmount(): void;
        setState(partialState: S, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void; /**
         * 横扫
         */
    };
};
export default _default;
