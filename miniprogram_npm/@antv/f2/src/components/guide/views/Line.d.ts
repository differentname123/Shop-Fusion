import { LineStyleProps } from '@antv/f-engine';
import { GuideProps } from '../withGuide';
export interface LineGuideProps extends GuideProps {
    points?: {
        x: number;
        y: number;
    }[] | null;
    style?: Partial<LineStyleProps> | ((record?: any) => Partial<LineStyleProps>);
    offsetX?: number | string | (number | string)[];
    offsetY?: number | string | (number | string)[];
    theme?: any;
}
declare const _default: (props: LineGuideProps, context: any) => import("@antv/f-engine").JSX.Element;
export default _default;
