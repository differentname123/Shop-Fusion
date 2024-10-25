import { RectStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface RectGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    style?: Partial<RectStyleProps> | ((record?: any) => Partial<RectStyleProps>);
    theme?: any;
}
declare const _default: (props: RectGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
