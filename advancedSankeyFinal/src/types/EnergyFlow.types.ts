// Types pour les EnergyFlowNode simplifiés
export interface EnergyFlowData {
    source: string;
    target: string;
    value: number;
    percentage: number;
}

export interface SankeyNode {
    id: string;
    name: string;
    level?: number;
}

export interface SankeyLink {
    source: number;
    target: number;
    value: number;
    percentage: number;
}

export interface SankeyFormattedData {
    nodes: SankeyNode[];
    links: SankeyLink[];
    status: "loading" | "available" | "error";
}