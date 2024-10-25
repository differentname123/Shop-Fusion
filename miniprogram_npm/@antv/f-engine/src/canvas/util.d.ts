import checkCSSRule from './cssRule';
declare function parsePadding(padding: number | number[]): number[];
declare function batch2hd(px2hd: any): (value: number | number[] | string | string[] | any) => any;
declare const px2hd: (value: number | number[] | string | string[] | any) => any;
export { px2hd, batch2hd, parsePadding, checkCSSRule };
