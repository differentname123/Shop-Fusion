import { AnimationProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface LottieGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    data?: string;
    offsetX?: number | string | (string | number)[];
    offsetY?: number | string | (string | number)[];
    animation: AnimationProps | ((points?: any, chart?: any) => AnimationProps);
    options?: {
        loop: boolean | number;
        autoplay: boolean;
    };
}
declare const _default: (props: LottieGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
