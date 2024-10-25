import { DisplayObjectConfig, BaseStyleProps } from '@antv/g-lite';
import { Path } from '@antv/g-lite';
export interface MarkerStyleProps extends BaseStyleProps {
    x?: string | number;
    y?: string | number;
    symbol?: 'circle' | 'square' | 'arrow';
    radius?: string | number;
}
export declare class Marker extends Path {
    parsedStyle: any;
    constructor(config: DisplayObjectConfig<MarkerStyleProps>);
    setAttribute(name: any, value: any, force?: boolean): void;
    updatePath(): void;
}
