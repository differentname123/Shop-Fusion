import { DisplayObject } from '@antv/g-lite';
type DisplayObjectConstructor = typeof DisplayObject;
/**
 * 注册新的标签
 */
declare const registerTag: (name: string, ShapeConstructor: any) => void;
declare const getTag: (type: string) => DisplayObjectConstructor;
export { registerTag, getTag };
