import React from 'react';
import { SankeyData, BaseNode } from '../../types/SankeyTypes';
interface ApexSankeyProps {
    data: SankeyData;
    onNodeClick?: (node: BaseNode) => void;
    unitOfMeasure?: string;
}
export declare const ApexSankeyDiagram: React.FC<ApexSankeyProps>;
export {};
//# sourceMappingURL=ApexSankey.d.ts.map