import { Path, BaseStyleProps } from '@antv/g-lite';
export interface SectorStyleProps extends BaseStyleProps {
    cx?: string | number;
    cy?: string | number;
    /** 起始角度 */
    startAngle?: string | number;
    endAngle?: string | number;
    r?: string | number;
    r0?: string | number;
    radius?: string | number | [string | number] | [string | number, string | number] | [string | number, string | number, string | number] | [string | number, string | number, string | number, string | number];
    anticlockwise?: boolean;
}
export declare class Sector extends Path {
    parsedStyle: any;
    constructor(config: any);
    setAttribute(name: any, value: any, force?: boolean): void;
    private updatePath;
    private createPath;
}
