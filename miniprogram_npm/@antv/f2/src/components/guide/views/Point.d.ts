import { CircleStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface PointGuideProps extends GuideProps {
    style?: Partial<CircleStyleProps> | ((record?: any) => Partial<CircleStyleProps>);
    offsetX?: number | string;
    offsetY?: number | string;
    points?: {
        x: number;
        y: number;
    }[] | null;
    theme?: any;
}
declare const _default: (props: PointGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
