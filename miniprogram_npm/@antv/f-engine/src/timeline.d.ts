import { JSX } from './jsx/jsx-namespace';
import Component from './component';
export interface TimelineProps {
    /**
     * @title 起始索引
     * @description 开始的组件索引
     */
    start?: number;
    /**
     * @title 延迟(ms)
     * @description 组件播放的延迟时间
     */
    delay?: number;
    /**
     * @title 自动循环
     * @description 是否自动循环
     */
    loop?: boolean;
    /**
     * @ignore
     * 自动播放
     */
    autoPlay?: boolean;
    /**
     * @ignore
     * 子组件
     */
    children?: any;
}
declare class Timeline extends Component<TimelineProps> {
    index: number;
    delay: number;
    private timer;
    constructor(props: TimelineProps);
    didMount(): void;
    willReceiveProps(nextProps: TimelineProps): void;
    didUnmount(): void;
    next: () => void;
    render(): JSX.Element;
}
export default Timeline;
