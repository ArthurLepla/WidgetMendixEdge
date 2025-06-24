import React from 'react';
import { ExtendedNode } from '../../types/SankeyTypes';
interface SankeyNodeProps {
    node: ExtendedNode;
    onClick?: (node: ExtendedNode) => void;
    isSelected?: boolean;
    isExpanded?: boolean;
    isExpandable?: boolean;
    isFocused?: boolean;
    isContextual?: boolean;
}
export declare const SankeyNode: React.FC<SankeyNodeProps>;
export {};
//# sourceMappingURL=SankeyNode.d.ts.map