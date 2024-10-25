import { ImageStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface ImageGuideProps extends GuideProps {
    src: string;
    points?: {
        x: number;
        y: number;
    }[] | null;
    attrs?: ImageStyleProps;
    style?: Partial<ImageStyleProps> | ((record?: any) => Partial<ImageStyleProps>);
    offsetX?: number | string;
    offsetY?: number | string;
}
declare const _default: (props: ImageGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
