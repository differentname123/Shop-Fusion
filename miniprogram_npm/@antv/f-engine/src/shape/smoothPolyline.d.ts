import { Path } from '@antv/g-lite';
export declare class SmoothPolyline extends Path {
    static tag: string;
    parsedStyle: any;
    constructor(config: any);
    setAttribute(name: any, value: any, force?: boolean): void;
    private updatePath;
}
