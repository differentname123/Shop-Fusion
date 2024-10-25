import { TextStyleProps } from '@antv/f-engine';
import Coord from '../../coord/base';
import { DataRecord } from '../../chart/Data';
import { TreemapProps as TreemapBaseProps, RecordNode } from './withTreemap';
export interface TreemapProps<TRecord extends DataRecord = DataRecord> extends TreemapBaseProps<TRecord> {
    label?: boolean | TextStyleProps;
    onClick?: (record: RecordNode<TRecord>) => void;
}
declare const _default: (props: TreemapProps<DataRecord> & {
    coord: Coord;
}) => import("@antv/f-engine").JSX.Element;
export default _default;
