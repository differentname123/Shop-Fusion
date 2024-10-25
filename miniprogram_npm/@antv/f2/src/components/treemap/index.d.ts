import withTreemap from './withTreemap';
import TreemapView, { TreemapProps } from './treemapView';
export { TreemapProps, withTreemap, TreemapView };
declare const _default: {
    new <TRecord extends import("../../chart/Data").DataRecord = import("../../chart/Data").DataRecord, P extends import("./withTreemap").TreemapProps<TRecord> = import("./withTreemap").TreemapProps<TRecord>>(props: P & TreemapProps<import("../../chart/Data").DataRecord>, context: any): {
        coord: import("../../controller/coord").default;
        color: import("../../attr/category").default;
        coordRef: import("@antv/f-engine").Ref<any>;
        records: import("./withTreemap").RecordNode<import("../../chart/Data").DataRecord>[];
        isSelected(record: any): boolean;
        getSelectionStyle(record: any): any;
        willMount(): void;
        willReceiveProps(nextProps: P): void;
        treemapLayout(): import("./withTreemap").RecordNode<import("../../chart/Data").DataRecord>[];
        select(ev: any, trigger: any): void;
        render(): import("@antv/f-engine").JSX.Element;
        props: P & TreemapProps<import("../../chart/Data").DataRecord>;
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
        didMount(): void;
        shouldUpdate(_nextProps: P & TreemapProps<import("../../chart/Data").DataRecord>): boolean;
        willUpdate(): void;
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
