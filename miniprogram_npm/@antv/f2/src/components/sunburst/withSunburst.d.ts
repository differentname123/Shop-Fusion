import { Ref, Component } from '@antv/f-engine';
import { Category } from '../../attr';
import CoordController from '../../controller/coord';
import { Data, DataRecord } from '../../chart/Data';
import { CoordProps } from '../../chart/Coord';
export interface ColorAttrObject {
    field: string;
    range?: any[];
    callback?: (value: any) => any;
}
export interface SunburstProps<TRecord extends DataRecord = DataRecord> {
    data: Data<TRecord>;
    coord?: CoordProps;
    color?: any[] | ColorAttrObject;
    value?: string;
    sort?: boolean;
    onClick?: (ev: any) => void;
}
declare const _default: (View: any) => {
    new <TRecord extends DataRecord = DataRecord, IProps extends SunburstProps<TRecord> = SunburstProps<TRecord>>(props: IProps, context: any): {
        coord: CoordController;
        color: Category;
        triggerRef: Ref[];
        willMount(): void;
        didMount(): void;
        _mapping(children: any): void;
        sunburst(): any;
        render(): import("@antv/f-engine").JSX.Element;
        props: IProps;
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
        shouldUpdate(_nextProps: IProps): boolean;
        willReceiveProps(_props: IProps, _context?: import("@antv/f-engine").IContext): void;
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
