import { ChartChildProps } from '../../chart';
import Selection, { SelectionProps, SelectionState } from './selection';
import { Adjust } from '../../deps/f2-adjust/src';
import AttrController from '../../controller/attr';
import { Scale } from '../../deps/f2-scale/src';
import { AnimationProps } from '@antv/f-engine';
import { AdjustType, AdjustProps } from './Adjust';
import { DataRecord, DataField } from '../../chart/Data';
export type GeometryType = 'line' | 'point' | 'area' | 'polygon' | 'schema' | 'interval';
export interface ColorAttrObject {
    type?: string;
    field?: string;
    range?: any[];
    callback?: (...args: any[]) => any;
    scale?: any;
}
export interface SizeAttrObject {
    type?: string;
    field?: string;
    range?: any[];
    callback?: (...args: any[]) => any;
    scale?: any;
}
export interface ShapeAttrObject {
    type?: string;
    field?: string;
    range?: any[];
    callback?: (...args: any[]) => any;
    scale?: any;
}
export interface GeometryProps<TRecord extends DataRecord = DataRecord> extends SelectionProps {
    x: DataField<TRecord>;
    y: DataField<TRecord>;
    color?: DataField<TRecord> | string | [string, any[]] | ColorAttrObject;
    size?: DataField<TRecord> | number | string | [string, any[]] | SizeAttrObject;
    shape?: DataField<TRecord> | number | string | [string, any[]] | ShapeAttrObject;
    adjust?: AdjustType | AdjustProps;
    startOnZero?: boolean;
    style?: any;
    animation?: AnimationProps;
    /**
     * 是否裁剪显示区
     */
    viewClip?: boolean;
    onPress?: Function;
    onPan?: Function;
    onPressStart?: Function;
    onPressEnd?: Function;
    onPanStart?: Function;
    onPanEnd?: Function;
}
declare class Geometry<TRecord extends DataRecord = DataRecord, P extends GeometryProps<TRecord> = GeometryProps<TRecord>, S extends SelectionState = SelectionState> extends Selection<P & ChartChildProps, S> {
    isGeometry: boolean;
    geomType: GeometryType;
    attrs: any;
    adjust: AdjustProps & {
        adjust: Adjust;
    };
    dataArray: any;
    dataRecords: any[];
    records: any[];
    mappedArray: any;
    justifyContent: boolean;
    startOnZero: boolean;
    connectNulls: boolean;
    sortable: boolean;
    attrController: AttrController;
    animation: AnimationProps;
    getDefaultCfg(): {};
    constructor(props: P & ChartChildProps, context?: any);
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
    _createAdjust(): AdjustProps & {
        adjust: Adjust;
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
    /**
     * 数据映射到视图属性核心逻辑
     * x、y 每个元素走 normalize 然后 convertPoint
     * color、size、shape
     *  如果是Linear，则每个元素 走 mapping
     *  如果是Category/Identity 则第一个元素走 mapping
     */
    _mapping(records: any): any[];
    mapping(): any[];
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
    getXScale(): Scale;
    getYScale(): Scale;
    _getXSnap(invertPointX: any): any;
    _getYSnapRecords(invertPointY: any, records: any): any;
    _getXSnapRecords(invertPointX: any, records: any): any;
    flatRecords(): any;
    getSnapRecords(point: any, inCoordRange?: any): any[];
    getRecords(data: any, field?: string): any[];
    getLegendItems(): any;
}
export default Geometry;
