import { SecteurNode, AtelierNode, MachineNode } from '../types/models/HierarchyTypes';
export declare class NodeFactory {
    static createSecteurNode(id: string, name: string): SecteurNode;
    static createAtelierNode(id: string, name: string, secteur: SecteurNode): AtelierNode;
    static createMachineNode(id: string, name: string, secteur: SecteurNode, atelier: AtelierNode | undefined, energyType: string, consumption: Array<{
        value: number;
        unit: string;
        timestamp?: Date;
    }>): MachineNode;
}
//# sourceMappingURL=NodeFactory.d.ts.map