import { SankeyData } from "../types/SankeyTypes";
export declare class SankeyDataService {
    filterByEnergyType(data: SankeyData, energyType: string): SankeyData;
    static validateData(data: SankeyData): boolean;
    static transformForD3(data: SankeyData): {
        nodes: {
            index: number | undefined;
            x0: number;
            x1: number;
            y0: number;
            y1: number;
            sourceLinks: any[];
            targetLinks: any[];
            metadata?: {
                type?: string | undefined;
                level?: number | undefined;
                energyType?: string | undefined;
                isVirtual?: boolean | undefined;
                hasParent?: boolean | undefined;
                isEmpty?: boolean | undefined;
                isOrphan?: boolean | undefined;
                originalValue?: number | undefined;
                normalizedValue?: number | undefined;
            } | undefined;
            id: string;
            name: string;
            category: string;
            value: number;
        }[];
        links: {
            source: number | undefined;
            target: number | undefined;
            value: number;
        }[];
    };
}
//# sourceMappingURL=SankeyDataService.d.ts.map