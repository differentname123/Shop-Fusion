import { Component, ComponentType, Ref } from '@antv/f-engine';
import { Category } from '../../attr';
import CoordController from '../../controller/coord';
import { Data, DataRecord, DataField } from '../../chart/Data';
import { CoordProps } from '../../chart/Coord';
export interface ColorAttrObject {
    field: string;
    range?: string[] | number[];
    callback?: (value: any) => string | number;
}
export interface RecordNode<TRecord extends DataRecord = DataRecord> {
    key: string | number | null | undefined;
    color: DataField<TRecord> | string;
    origin: TRecord;
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
    style: any;
}
export interface TreemapProps<TRecord extends DataRecord = DataRecord> {
    data: Data<TRecord>;
    value: DataField<TRecord> | string;
    coord?: CoordProps;
    color?: ColorAttrObject;
    space?: number;
    theme?: Record<string, any>;
    nodes?: RecordNode<TRecord>[];
    selection?: any;
}
declare const withTreemap: <IProps extends TreemapProps<DataRecord> = TreemapProps<DataRecord>>(View: ComponentType<IProps>) => {
    new <TRecord extends DataRecord = DataRecord, P extends TreemapProps<TRecord> = TreemapProps<TRecord>>(props: P & IProps, context: any): {
        coord: CoordController;
        color: Category;
        coordRef: Ref;
        records: RecordNode<DataRecord>[];
        isSelected(record: any): boolean;
        getSelectionStyle(record: any): any;
        willMount(): void;
        willReceiveProps(nextProps: P): void;
        treemapLayout(): RecordNode[];
        select(ev: any, trigger: any): void;
        render(): import("@antv/f-engine").JSX.Element;
        props: P & IProps;
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
        didMount(): void;
        shouldUpdate(_nextProps: P & IProps): boolean;
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
export default withTreemap;
