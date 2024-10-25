import { Component, GroupStyleProps, TextStyleProps } from '@antv/f-engine';
import { ChartChildProps } from '../../chart';
interface LegendItem {
    /**
     * 标记颜色。
     */
    color?: string;
    /**
     * 名称。
     */
    name?: string;
    /**
     * 值。
     */
    value?: string | number;
    /**
     * 图例标记。
     */
    marker?: string;
    [key: string]: any;
}
export interface LegendProps {
    /**
     * 图例的显示位置。默认为 top。
     */
    position?: 'right' | 'left' | 'top' | 'bottom';
    /**
     * 图例宽度
     */
    width?: number | string;
    /**
     * 图例高度
     */
    height?: number | string;
    /**
     * legend 和图表内容的间距
     */
    margin?: number | string;
    /**
     * 回调函数，用于格式化图例每项的文本显示。
     */
    itemFormatter?: (value: any, name: any) => string;
    /**
     * 图例项列表。
     */
    items?: LegendItem[];
    /**
     * 图例样式。
     */
    style?: GroupStyleProps;
    /**
     * 图例标记。
     */
    marker?: 'circle' | 'square' | 'line';
    /**
     * 用于设置图例项的样式
     */
    itemStyle?: GroupStyleProps;
    /**
     * 用于设置图例项的文本样式
     */
    nameStyle?: Omit<TextStyleProps, 'text'>;
    /**
     * 用于设置图例项的文本样式
     */
    valueStyle?: Omit<TextStyleProps, 'text'>;
    /**
     * value展示文案的前缀
     */
    valuePrefix?: string;
    /**
     * 是否可点击
     */
    clickable?: boolean;
    onClick?: (item: LegendItem) => void;
}
declare const _default: (View: any) => {
    new <IProps extends LegendProps = LegendProps>(props: any): {
        legendStyle: GroupStyleProps;
        itemWidth: Number;
        getOriginItems(): any;
        getItems(): any;
        setItems(items: any): void;
        getMaxItemBox(node: any): {
            width: number;
            height: number;
        };
        _init(): void;
        updateCoord(): void;
        willMount(): void;
        didMount(): void;
        willUpdate(): void;
        _onclick: (item: any) => void;
        render(): import("@antv/f-engine").JSX.Element;
        props: IProps & ChartChildProps<import("../../chart/Data").DataRecord>;
        state: import("@antv/f-engine").IState;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: Component<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        updater: import("@antv/f-engine/es/component/updater").Updater<import("@antv/f-engine").IState>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode;
        shouldUpdate(_nextProps: IProps & ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        willReceiveProps(_props: IProps & ChartChildProps<import("../../chart/Data").DataRecord>, _context?: import("@antv/f-engine").IContext): void;
        didUpdate(): void;
        willUnmount(): void;
        didUnmount(): void;
        setState(partialState: import("@antv/f-engine").IState, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void;
    };
};
export default _default;
