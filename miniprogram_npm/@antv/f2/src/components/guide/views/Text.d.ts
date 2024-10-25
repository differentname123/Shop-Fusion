import { TextStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface TextGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    content: string | number;
    style?: Partial<TextStyleProps> | ((record?: any) => Partial<TextStyleProps>);
    offsetX?: number | string;
    offsetY?: number | string;
    theme?: any;
}
declare const _default: (props: TextGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
