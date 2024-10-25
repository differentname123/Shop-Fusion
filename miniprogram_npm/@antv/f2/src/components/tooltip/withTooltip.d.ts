import { Component, TextStyleProps, RectStyleProps, LineStyleProps } from '@antv/f-engine';
import { ChartChildProps } from '../../chart';
export interface DataRecord {
    origin: any;
    [k: string]: any;
}
export interface TooltipProps {
    /**
     * 是否显示
     */
    visible?: boolean;
    /**
     * 顶部边距
     */
    padding?: string;
    /**
     * 显示事件名，默认为 press
     */
    triggerOn?: 'press' | 'click';
    /**
     * 消失的事件名，默认为 pressend
     */
    triggerOff?: 'pressend';
    /**
     * 是否一直显示
     */
    alwaysShow?: boolean;
    /**
     * 是否显示十字线
     */
    showCrosshairs?: boolean;
    /**
     * 十字线类型
     */
    crosshairsType?: 'x' | 'y' | 'xy';
    /**
     * 十字线样式
     */
    crosshairsStyle?: LineStyleProps;
    /**
     * 是否显示辅助点
     */
    snap?: boolean;
    /**
     * 名称样式
     */
    nameStyle?: TextStyleProps;
    /**
     * 值样式
     */
    valueStyle?: TextStyleProps;
    /**
     * 背景样式
     */
    background?: RectStyleProps;
    /**
     * 是否显示
     */
    showItemMarker?: boolean;
    defaultItem?: any;
    custom?: boolean;
    tooltipMarkerStyle?: any;
    onChange?: any;
    showXTip?: boolean;
    /**
     * x 的位置点类型，record 表示按照数据取位置点，coord 表示按照坐标取位置点
     */
    xPositionType?: 'record' | 'coord';
    showYTip?: boolean;
    /**
     * x 的位置点类型，record 表示按照数据取位置点，coord 表示按照坐标取位置点
     */
    yPositionType?: 'record' | 'coord';
    showTooltipMarker?: boolean;
    customText?: any;
    markerBackgroundStyle?: any;
    [key: string]: any;
}
export interface TooltipState {
    records: DataRecord[];
}
declare const _default: (View: any) => {
    new <IProps extends TooltipProps = TooltipProps>(props: IProps & ChartChildProps<import("../../chart/Data").DataRecord>): {
        updateCoord(): void;
        willMount(): void;
        didMount(): void;
        _initEvent(): void;
        willReceiveProps(nextProps: any): void;
        _initShow(): void;
        _showByData(dataItem: any): void;
        _triggerOn: (ev: any) => void;
        _triggerOff: () => void;
        show(point: any, _ev?: any): void;
        showSnapRecords(snapRecords: any): void;
        hide(): void;
        render(): import("@antv/f-engine").JSX.Element;
        props: IProps & ChartChildProps<import("../../chart/Data").DataRecord>;
        state: TooltipState;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: Component<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        /**
         * 是否一直显示
         */
        updater: import("@antv/f-engine/es/component/updater").Updater<TooltipState>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode; /**
         * 是否显示辅助点
         */
        shouldUpdate(_nextProps: IProps & ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        willUpdate(): void;
        didUpdate(): void;
        willUnmount(): void;
        didUnmount(): void;
        setState(partialState: TooltipState, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void;
    };
};
export default _default;
