import React from "react";
interface DebugData {
    timestamp: string;
    hierarchyData: {
        nodes: any[];
        links: any[];
        timeRange?: {
            start: Date;
            end: Date;
        };
    };
    validationStats: {
        total: number;
        valid: number;
        invalid: number;
        withWorkshop: number;
        withoutWorkshop: number;
    };
    nodeStats: {
        sectors: {
            count: number;
            list: Array<{
                id: string;
                name: string;
                machineCount: number;
                workshopCount: number;
                totalConsumption: number;
            }>;
        };
        workshops: {
            count: number;
            list: Array<{
                id: string;
                name: string;
                sector: string;
                machineCount: number;
                totalConsumption: number;
            }>;
        };
        machines: {
            count: number;
            byEnergy: {
                [key: string]: number;
            };
            bySector: {
                [key: string]: number;
            };
            byWorkshop: {
                [key: string]: number;
            };
        };
    };
    linkStats: {
        total: number;
        sectorToWorkshop: number;
        workshopToMachine: number;
        sectorToMachine: number;
        orphanedLinks: string[];
    };
    errors: Array<{
        type: string;
        message: string;
        details?: any;
    }>;
    warnings: Array<{
        type: string;
        message: string;
        details?: any;
    }>;
    performance: {
        startTime: number;
        endTime: number;
        duration: number;
        nodeProcessingTime: number;
        linkProcessingTime: number;
    };
}
interface DebugToolsProps {
    data: DebugData;
}
export declare const DebugTools: React.FC<DebugToolsProps>;
export {};
//# sourceMappingURL=DebugTools.d.ts.map