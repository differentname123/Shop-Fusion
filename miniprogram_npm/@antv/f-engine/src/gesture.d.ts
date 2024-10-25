import { DisplayObject, Canvas } from '@antv/g-lite';
declare class Gesture {
    private el;
    constructor(element: DisplayObject | Canvas);
    on(eventName: string, listener: (...args: any[]) => void): void;
    off(eventName: string, listener: (...args: any[]) => void): void;
}
export default Gesture;
