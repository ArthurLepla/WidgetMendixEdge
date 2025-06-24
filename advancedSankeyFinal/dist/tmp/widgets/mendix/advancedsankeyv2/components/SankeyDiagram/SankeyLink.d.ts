import React from 'react';
import { ExtendedNode } from '../../types/SankeyTypes';
interface SankeyLinkProps {
    link: {
        source: ExtendedNode & {
            x0: number;
            x1: number;
            y0: number;
            y1: number;
        };
        target: ExtendedNode & {
            x0: number;
            x1: number;
            y0: number;
            y1: number;
        };
        width: number;
        value: number;
        metadata?: {
            sourceLevel: string;
            targetLevel: string;
            isDirectLink?: boolean;
            skipLevels?: boolean;
        };
    };
    isHighlighted?: boolean;
}
export declare const SankeyLink: React.FC<SankeyLinkProps>;
export {};
//# sourceMappingURL=SankeyLink.d.ts.map