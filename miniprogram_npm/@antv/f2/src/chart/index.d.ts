import { GroupStyleProps, IContext, LayoutProps, Component, Ref } from '@antv/f-engine';
import { ScaleConfig } from '../deps/f2-scale/src';
import CoordController, { Coord } from '../controller/coord';
import ScaleController from '../controller/scale';
import { Data, DataRecord, DataRecordScale } from './Data';
import { CoordType, CoordProps } from './Coord';
export { Point } from './types';
export interface ChartProps<TRecord extends DataRecord = DataRecord> {
    data: Data<TRecord>;
    scale?: DataRecordScale<TRecord>;
    coord?: CoordType | CoordProps;
    style?: GroupStyleProps;
    theme?: Record<string, any>;
    children?: any;
}
export interface ChartState {
    filters: any;
}
export interface ChartChildProps<TRecord extends DataRecord = DataRecord> {
    data?: Data<TRecord>;
    chart?: Chart<TRecord>;
    coord?: Coord;
    layout?: LayoutProps;
}
export interface PositionLayout {
    position: 'top' | 'right' | 'bottom' | 'left';
    width: number;
    height: number;
}
export interface ComponentPosition {
    component: Component;
    layout: PositionLayout | PositionLayout[];
}
declare class Chart<TRecord extends DataRecord = DataRecord, IProps extends ChartProps<TRecord> = ChartProps<TRecord>> extends Component<IProps, ChartState> {
    private componentsPosition;
    coord: CoordController;
    scale: ScaleController;
    coordRef: Ref;
    constructor(props: IProps, context?: IContext);
    private getStyle;
    willMount(): void;
    willReceiveProps(nextProps: IProps, context: any): void;
    willUpdate(): void;
    on(eventName: string, listener: (...args: any[]) => void): void;
    off(eventName: string, listener: (...args: any[]) => void): void;
    layoutCoord(layout: PositionLayout): void;
    resetCoordLayout(): void;
    updateCoordLayout(layout: PositionLayout | PositionLayout[]): void;
    updateCoordFor(component: Component, layout: PositionLayout | PositionLayout[]): void;
    removeComponentsPositionCache(): void;
    getGeometrys(): Component<import("@antv/f-engine").IProps, import("@antv/f-engine").IState>[];
    /**
     * calculate dataset's position on canvas
     * @param  {Object} record the dataset
     * @return {Object} return the position
     */
    getPosition(record: any): {
        x: any;
        y: any;
    };
    getSnapRecords(point: any, inCoordRange?: any): any;
    getRecords(data: any, field: any): any;
    getLegendItems(point?: any): any;
    setScale(field: string, option: ScaleConfig): void;
    getScale(field: string): import("../deps/f2-scale/src").Scale;
    getScales(): {
        [field: string]: import("../deps/f2-scale/src").Scale;
    };
    getXScales(): any[];
    getYScales(): any[];
    getLayout(): import("../controller/coord").Layout;
    getCoord(): Coord;
    filter(field: string, condition: any): void;
    _getRenderData(): Data<TRecord>;
    render(): import("@antv/f-engine").JSX.Element;
}
export default Chart;
