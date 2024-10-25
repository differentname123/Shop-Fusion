import { Scale, ScaleConfig } from '../deps/f2-scale/src';
export type ScaleOption = {
    type?: string;
    justifyContent?: boolean;
} & ScaleConfig;
declare class ScaleController {
    private data;
    private options;
    private scales;
    constructor(data: any);
    private _getType;
    private _getOption;
    private createScale;
    setScale(field: string, option?: ScaleOption): void;
    create(options: {
        [k: string]: ScaleOption;
    }): void;
    update(options: {
        [k: string]: ScaleOption;
    }): void;
    changeData(data: any): void;
    getData(): any;
    getScale(field: string): Scale;
    getScales(): {
        [field: string]: Scale;
    };
    getOptions(): {};
    adjustStartZero(scale: Scale): void;
    adjustPieScale(scale: Scale): any;
    _updateStackRange(scale: Scale, flattenArray: any): void;
    getZeroValue(scale: any): any;
}
export default ScaleController;
