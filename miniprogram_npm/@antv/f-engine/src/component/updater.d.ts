import Canvas from '../canvas';
import Component from '.';
export interface Updater<S = any> {
    enqueueSetState: (component: Component, partialState: S, callback?: () => void) => void;
    enqueueForceUpdate: (component: Component, partialState: S, callback?: () => void) => void;
}
declare function createUpdater(canvas: Canvas): {
    enqueueForceUpdate: (component: Component, state: any, callback?: () => void) => void;
    enqueueSetState: (component: Component, state: any, callback?: () => void) => void;
};
export { createUpdater };
