import { Component } from '@antv/f-engine';
import { ChartChildProps, PositionLayout } from '../../chart';
import { Style, AxisProps } from './types';
import { DataRecord } from '../../chart/Data';
type BBox = {
    height: number;
    width: number;
};
export { AxisProps };
declare const _default: (View: any) => {
    new <TRecord extends DataRecord = DataRecord, IProps extends AxisProps<TRecord, keyof TRecord> = AxisProps<TRecord, keyof TRecord>>(props: IProps & ChartChildProps<DataRecord>): {
        axisStyle: Style;
        willReceiveProps(nextProps: IProps & ChartChildProps<DataRecord>): void;
        willMount(): void;
        willUpdate(): void;
        getScaleOption(props: IProps): {
            type: string;
            tickCount: number;
            range: any;
            mask: string;
            formatter: (value: import("../../chart/Data").DataValue<TRecord, keyof TRecord>) => string | number;
            min: number;
            max: number;
            nice: boolean;
            ticks: any;
        };
        _getDimType(): 'x' | 'y';
        getMaxBBox(ticks: any, style: Style): BBox;
        _getPosition(): "right" | "left" | "top" | "bottom";
        getTicks(): import("../../deps/f2-scale/src").Tick[];
        /**
         * 生成极坐标下网格线的交叉点
         * @param ticks
         * @returns
         */
        _generateGridPoints(ticks: any): any;
        _setTicksStyle(ticks: any): any;
        convertTicks(ticks: any): any;
        measureLayout(): PositionLayout | PositionLayout[];
        updateCoord(): void;
        render(): import("@antv/f-engine").JSX.Element;
        props: IProps & ChartChildProps<DataRecord>;
        state: {};
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: Component<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        updater: import("@antv/f-engine/es/component/updater").Updater<{}>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode;
        didMount(): void;
        shouldUpdate(_nextProps: IProps & ChartChildProps<DataRecord>): boolean;
        didUpdate(): void;
        willUnmount(): void;
        didUnmount(): void;
        setState(partialState: {}, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void;
    };
};
export default _default;
