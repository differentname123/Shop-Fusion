import { JSX } from './jsx/jsx-namespace';
import Component from './component';
import { playerFrame } from './playerFrames';
import { IContext } from './types';
import { VNode } from './canvas/vnode';
type playState = 'play' | 'pause' | 'finish';
export interface PlayerProps {
    /**
     * 播放状态
     */
    state?: playState;
    /**
     * 播放速率，默认为 1
     */
    speed?: number;
    children?: JSX.Element | null;
    keyFrames?: Record<string, playerFrame>[];
    /**
     * 协议动画播放结束
     */
    onend?: Function;
    /**
     * 时间
     */
    goTo?: number;
}
declare class Player extends Component<PlayerProps> {
    playerFrames: any;
    timeline: any;
    index: number;
    onend: Function;
    preNode: VNode;
    /**
     * 内部播放真实状态 play pause finish
     */
    playState: any;
    constructor(props: any);
    didMount(): void;
    willReceiveProps(nextProps: PlayerProps, _context?: IContext): void;
    setPlayState(state: any): void;
    goTo(time: any): void;
    setPlaybackRate(speed: any): void;
    render(): any;
}
export default Player;
