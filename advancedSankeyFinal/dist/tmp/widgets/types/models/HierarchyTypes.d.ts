import { BaseEntity, ConsumptionData, NodeMetadata } from './BaseTypes';
export interface HierarchyNodeMethods {
    getPath(): string[];
    getTotalConsumption(): number;
    findChild(id: string): HierarchyNode | undefined;
    findParent(id: string): HierarchyNode | undefined;
    isDescendantOf(node: HierarchyNode): boolean;
    isAncestorOf(node: HierarchyNode): boolean;
    getDepth(): number;
    getConsumptionByUnit(unit: string): number;
}
export interface HierarchyNodeData extends BaseEntity {
    metadata: NodeMetadata;
    consumption: ConsumptionData[];
    children?: HierarchyNode[];
    parent?: HierarchyNode;
    [key: string]: any;
}
export interface HierarchyNode extends HierarchyNodeData, HierarchyNodeMethods {
}
export interface SecteurNodeData extends HierarchyNodeData {
    metadata: NodeMetadata & {
        type: 'secteur';
    };
}
export interface SecteurNode extends SecteurNodeData, HierarchyNodeMethods {
}
export interface AtelierNodeData extends HierarchyNodeData {
    metadata: NodeMetadata & {
        type: 'atelier';
    };
    secteur: SecteurNode;
}
export interface AtelierNode extends AtelierNodeData, HierarchyNodeMethods {
}
export interface MachineNodeData extends HierarchyNodeData {
    metadata: NodeMetadata & {
        type: 'machine';
    };
    atelier?: AtelierNode;
    secteur: SecteurNode;
    energyType: string;
}
export interface MachineNode extends MachineNodeData, HierarchyNodeMethods {
}
export interface HierarchyData {
    nodes: HierarchyNode[];
    links: HierarchyLink[];
    timeRange?: {
        start: Date;
        end: Date;
    };
}
export interface HierarchyLink {
    source: string;
    target: string;
    value: number;
}
export declare class HierarchyNodeImpl implements HierarchyNodeMethods {
    private node;
    constructor(node: HierarchyNodeData);
    getPath(): string[];
    getTotalConsumption(): number;
    findChild(id: string): HierarchyNode | undefined;
    findParent(id: string): HierarchyNode | undefined;
    isDescendantOf(node: HierarchyNode): boolean;
    isAncestorOf(node: HierarchyNode): boolean;
    getDepth(): number;
    getConsumptionByUnit(unit: string): number;
}
//# sourceMappingURL=HierarchyTypes.d.ts.map