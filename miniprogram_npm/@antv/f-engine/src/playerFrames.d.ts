export interface playerFrame {
    to: Record<string, any>;
    duration?: number;
    delay?: number;
}
export declare function generateFrameElement(cur: Record<string, playerFrame>, element: any): any;
