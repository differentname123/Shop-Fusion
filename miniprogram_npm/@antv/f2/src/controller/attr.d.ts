import ScaleController from './scale';
type AttrOption = {
    field?: string | Record<any, any>;
    range?: any[];
};
export type GroupAttr = 'color' | 'size' | 'shape';
export type Attr = GroupAttr | 'x' | 'y';
type AttrsRange = {
    [key: string]: any;
};
export declare const ATTRS: string[];
declare class AttrController {
    private scaleController;
    private options;
    attrs: any;
    attrsRange: any;
    constructor(scaleController: ScaleController, attrsRange: AttrsRange);
    parseOption(option: AttrOption, attrName: Attr): AttrOption | {
        type: string;
        field?: undefined;
        range?: undefined;
    } | {
        field: AttrOption & string;
        type: string;
        range?: undefined;
    } | {
        type: string;
        field: AttrOption & number;
        range?: undefined;
    } | {
        field: any;
        range: any;
        type?: undefined;
    };
    getAttrOptions(props: any, justifyContentCenter: boolean): {};
    getDefaultAttrValues(): {
        color: any;
        shape: any;
    };
    getGroupScales(): any[];
    private createAttr;
    create(options: any): void;
    update(nextOptions: any): void;
    getAttr(attrName: string): any;
    getAttrs(): any;
    isGroupAttr(attrName: GroupAttr): boolean;
    getAttrsByLinear(): {
        linearAttrs: any[];
        nonlinearAttrs: any[];
    };
}
export default AttrController;
