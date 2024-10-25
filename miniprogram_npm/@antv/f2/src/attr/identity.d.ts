import { Identity as IdentityScale, ScaleConfig } from '../deps/f2-scale/src';
import Base from './base';
declare class Identity extends Base {
    createScale(scaleConfig: ScaleConfig): IdentityScale;
    _mapping(): string | number;
}
export default Identity;
