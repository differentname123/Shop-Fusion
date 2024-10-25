import Coord from '../coord';
export interface Style {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    padding?: number[];
}
export interface Layout {
    left: number;
    top: number;
    width: number;
    height: number;
}
declare class coordController {
    layout: Layout;
    coord: Coord;
    private getOption;
    create(cfg: any): any;
    updateLayout(style: Style): void;
    useLayout(positionLayout: any): void;
    update(): void;
    getCoord(): Coord;
}
export { Coord };
export default coordController;
