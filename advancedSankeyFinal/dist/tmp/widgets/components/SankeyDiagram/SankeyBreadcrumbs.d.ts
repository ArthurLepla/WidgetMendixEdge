import React from 'react';
interface SankeyBreadcrumbsProps {
    path: Array<{
        id: string;
        name: string;
        level: string;
    }>;
    onNavigate: (index: number) => void;
}
export declare const SankeyBreadcrumbs: React.FC<SankeyBreadcrumbsProps>;
export {};
//# sourceMappingURL=SankeyBreadcrumbs.d.ts.map