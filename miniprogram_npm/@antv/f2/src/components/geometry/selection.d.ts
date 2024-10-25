import { Component, ShapeStyleProps } from '@antv/f-engine';
import { ChartChildProps } from '../../chart';
type StyleType = (record: any) => ShapeStyleProps;
export interface SelectionProps {
    selection?: {
        triggerOn?: 'click' | 'press' | string;
        type?: 'single' | 'multiple';
        defaultSelected?: any[];
        selectedStyle?: ShapeStyleProps | StyleType;
        unSelectedStyle?: ShapeStyleProps | StyleType;
        cancelable?: boolean;
        onChange?: Function;
    };
}
export interface SelectionState {
    selected: any[];
}
declare class Selection<P extends SelectionProps = SelectionProps, S extends SelectionState = SelectionState> extends Component<P & ChartChildProps, S> {
    constructor(props: P, context: any);
    didMount(): void;
    willReceiveProps(nextProps: P): void;
    getSnapRecords(_point: any): any;
    isSelected(record: any): boolean;
    getSelectionStyle(record: any): ShapeStyleProps;
}
export default Selection;
