import withLegend, { LegendProps } from './withLegend';
import LegendView from './legendView';
export { LegendProps, withLegend, LegendView };
declare const _default: {
    new <IProps extends LegendProps = LegendProps>(props: any): {
        legendStyle: import("@antv/f-engine").GroupStyleProps;
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
        props: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>;
        state: import("@antv/f-engine").IState;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: import("@antv/f-engine/es/component").default<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
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
        shouldUpdate(_nextProps: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        willReceiveProps(_props: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>, _context?: import("@antv/f-engine").IContext): void;
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
