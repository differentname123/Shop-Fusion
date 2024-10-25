import Animator from './render/animator';
import EE from 'eventemitter3';
type AnimUnit = {
    animators: Animator[];
    time: number;
};
declare class Timeline extends EE {
    animator: Animator;
    animUnits: AnimUnit[];
    frame: number;
    playState: string;
    endFrame: number;
    speed: number;
    time: number;
    totalDuration: number;
    constructor(props: any);
    start(): void;
    next: () => void;
    drawFrame(): void;
    setPlayState(state: any): void;
    setPlaybackRate(speed: any): void;
    getPlayState(): string;
    updateState(state: any): void;
    clear(): void;
    goTo(time: any): void;
    setFinishState(): void;
}
export default Timeline;
