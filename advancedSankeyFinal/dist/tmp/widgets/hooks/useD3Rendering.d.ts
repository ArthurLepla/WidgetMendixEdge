/**
 * Hook personnalisé pour le rendu D3 des diagrammes Sankey
 * Isole toute la complexité du rendu D3 du composant principal
 */
import { RefObject } from "react";
import { SankeyData, BaseNode } from "../types/SankeyTypes";
import { SankeyContext } from "../states/SankeyStates";
import { PriceData } from "../services/PriceCalculationService";
interface D3RenderingProps {
    svgRef: RefObject<SVGSVGElement>;
    containerRef: RefObject<HTMLDivElement>;
    sankeyData: SankeyData | null;
    sankeyContext: SankeyContext;
    selectedNode: string | null;
    dimensions: {
        width: number;
        height: number;
    };
    selectedEnergies: string;
    displayMode: "consumption" | "cost";
    priceData: PriceData | null;
    currency: string;
    startDate?: Date;
    endDate?: Date;
    onNodeClick: (node: BaseNode) => void;
    showDebugTools?: boolean;
}
export declare const useD3Rendering: (props: D3RenderingProps) => void;
export {};
//# sourceMappingURL=useD3Rendering.d.ts.map