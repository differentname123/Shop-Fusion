import { GaugeProps } from './withGauge';
export interface Point {
    x: number;
    y: number;
}
export interface Tick {
    tickValue: number;
    start: Point;
    end: Point;
}
export { GaugeProps };
declare const _default: (props: GaugeProps) => import("@antv/f-engine").JSX.Element;
export default _default;
