import { ObjectItem } from "mendix";
import { SankeyData, DebugStats } from "../types/SankeyTypes";
export declare class MendixDataAdapter {
    private debugMode;
    private debugStats;
    constructor(debugMode?: boolean);
    private initDebugStats;
    private extractNodeData;
    private createLinks;
    processData(items: ObjectItem[]): Promise<SankeyData>;
    getDebugStats(): DebugStats;
}
//# sourceMappingURL=MendixDataAdapter.d.ts.map