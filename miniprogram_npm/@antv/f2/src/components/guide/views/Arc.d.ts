import { ArcStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface ArcGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    style?: Partial<ArcStyleProps> | ((record?: any) => Partial<ArcStyleProps>);
    theme?: any;
}
declare const _default: (props: ArcGuideProps) => import("@antv/f-engine").JSX.Element;
export default _default;
