import { Component } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface TagGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    canvasWidth?: number;
    canvasHeight?: number;
    offsetX?: number | string;
    offsetY?: number | string;
    autoAdjust?: boolean;
    /**
     * 箭头的方向
     */
    direct?: string;
    /**
     * 箭头的边长
     */
    side?: string | number;
    /**
     * 文字内容
     */
    content?: string;
    /**
     * 背景样式设置，见 group 绘图属性
     */
    background?: any;
    /**
     * 文字样式
     */
    textStyle?: any;
}
export default class Tag extends Component<TagGuideProps> {
    render(): import("@antv/f-engine").JSX.Element;
}
