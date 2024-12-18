import withLine, { LineProps } from './withLine';
import LineView from './lineView';
export { LineProps, withLine, LineView };
declare const _default: {
    new <TRecord extends import("../../chart/Data").DataRecord = import("../../chart/Data").DataRecord, IProps extends LineProps<TRecord> = LineProps<TRecord>>(props: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>, context?: any): {
        getDefaultCfg(): {
            geomType: string;
            sortable: boolean;
        };
        splitPoints(points: any): any[][];
        splitNulls(points: any, connectNulls: any): any[];
        mapping(): any[];
        concatPoints(topPoints: import("../../chart").Point[], bottomPoints: import("../../chart").Point[]): import("../../chart").Point[];
        render(): import("@antv/f-engine").JSX.Element;
        isGeometry: boolean;
        geomType: import("../geometry").GeometryType;
        attrs: any;
        adjust: import("../geometry/Adjust").AdjustProps & {
            adjust: import("../../deps/f2-adjust/src").Adjust;
        };
        dataArray: any;
        dataRecords: any[];
        records: any[];
        mappedArray: any;
        justifyContent: boolean;
        startOnZero: boolean;
        connectNulls: boolean;
        sortable: boolean;
        attrController: import("../../controller/attr").default;
        animation: import("@antv/f-engine").AnimationProps;
        getAttrOptions(props: any): {};
        willReceiveProps(nextProps: any): void;
        willMount(): void;
        willUpdate(): void;
        didMount(): void;
        _initEvent(): void;
        _createAttrs(): void;
        _getThemeAttrsRange(): {
            x: import("../../coord/types").Range;
            y: import("../../coord/types").Range;
            color: any;
            size: any;
            shape: any;
        };
        _createAdjust(): import("../geometry/Adjust").AdjustProps & {
            adjust: import("../../deps/f2-adjust/src").Adjust;
        };
        _adjustScales(): void;
        _groupData(data: any): any[];
        _saveOrigin(originData: any): any[];
        _numberic(data: any): void;
        _adjustData(records: any): any;
        _processData(): void;
        _readjustData(records: any): void;
        _sortData(records: any): void;
        getY0Value(): any;
        _getShapeStyle(shape: any, origin: any): any;
        _mapping(records: any): any[];
        getClip(): {
            type: string;
            style: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        };
        getAttr(attrName: string): any;
        getXScale(): import("../..").Scale;
        getYScale(): import("../..").Scale;
        _getXSnap(invertPointX: any): any;
        _getYSnapRecords(invertPointY: any, records: any): any;
        _getXSnapRecords(invertPointX: any, records: any): any;
        flatRecords(): any;
        getSnapRecords(point: any, inCoordRange?: any): any[];
        getRecords(data: any, field?: string): any[];
        getLegendItems(): any;
        isSelected(record: any): boolean;
        getSelectionStyle(record: any): import("@antv/f-engine").ShapeStyleProps;
        props: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>;
        state: import("../geometry/selection").SelectionState;
        context: import("@antv/f-engine").IContext;
        refs: {
            [key: string]: import("@antv/f-engine/es/component").default<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>;
        };
        updater: import("@antv/f-engine/es/component/updater").Updater<import("../geometry/selection").SelectionState>;
        container: import("@antv/g-lite").Group;
        layout: import("@antv/f-engine").LayoutProps;
        children: import("@antv/f-engine/es/canvas/vnode").VNode | import("@antv/f-engine/es/canvas/vnode").VNode[];
        isMounted: boolean;
        animate: boolean;
        animator: import("@antv/f-engine/es/canvas/render/animator").default;
        destroyed: boolean;
        _vNode: import("@antv/f-engine/es/canvas/vnode").VNode;
        shouldUpdate(_nextProps: IProps & import("../../chart").ChartChildProps<import("../../chart/Data").DataRecord>): boolean;
        didUpdate(): void;
        willUnmount(): void;
        didUnmount(): void;
        setState(partialState: import("../geometry/selection").SelectionState, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        setAnimate(animate: boolean): void;
        destroy(): void;
    };
};
export default _default;
