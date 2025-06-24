import React from "react";
import { ExtendedNode } from "../../types/SankeyTypes";
interface SankeyChartProps {
    nodes: ExtendedNode[];
    links: any[];
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    onNodeClick: (node: ExtendedNode) => void;
    unitOfMeasure?: string;
}
export declare const SankeyChart: React.FC<SankeyChartProps>;
export {};
//# sourceMappingURL=SankeyChart.d.ts.map