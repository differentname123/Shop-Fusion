import { DisplayObject } from '@antv/g-lite';
import Gesture from '../../gesture';
declare function createShape(type: string, props: any): DisplayObject<any, any>;
declare function updateShape(shape: DisplayObject, props: any, lastProps: any): DisplayObject<any, any>;
declare function addEvent(shape: any, props: any): Gesture;
export { createShape, updateShape, addEvent };
