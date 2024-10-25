import { Path, BaseStyleProps } from '@antv/g-lite';
export interface ArcStyleProps extends BaseStyleProps {
    /**
     * @title 起始角度/弧度
     */
    startAngle: string | number;
    /**
     * @title 结束角度/弧度
     */
    endAngle: string | number;
    /**
     * @title 半径
     */
    r: string | number;
    /**
     * @title 圆心 x 坐标
     */
    cx?: string | number;
    /**
     * @title 圆心 y 坐标
     */
    cy?: string | number;
    /**
     * @title 逆时针绘制
     */
    anticlockwise?: boolean;
}
export declare class Arc extends Path {
    parsedStyle: any;
    constructor(config: any);
    setAttribute(name: any, value: any, force?: boolean): void;
    private updatePath;
    private createPath;
}
