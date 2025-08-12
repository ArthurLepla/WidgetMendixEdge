import { EnergyFlowData, SankeyFormattedData } from "../types/EnergyFlow.types";

/**
 * Transformations pour convertir les EnergyFlowNode vers différents formats
 */
export class DataTransformers {
    
    /**
     * Transforme les données de flux en format D3-Sankey
     */
    static toSankeyFormat(flows: EnergyFlowData[]): SankeyFormattedData {
        try {
            // Extraction des nœuds uniques
            const nodeIds = new Set<string>();
            flows.forEach(flow => {
                nodeIds.add(flow.source);
                nodeIds.add(flow.target);
            });
            
            const nodes = Array.from(nodeIds).map((id, index) => ({
                id: id,
                name: id,
                level: DataTransformers.calculateNodeLevel(id, flows)
            }));
            
            // Création de l'index des nœuds
            const nodeIndexMap = new Map<string, number>();
            nodes.forEach((node, index) => {
                nodeIndexMap.set(node.id, index);
            });
            
            // Transformation des liens
            const links = flows
                .filter(flow => flow.value > 0) // Filtrer les valeurs nulles
                .map(flow => ({
                    source: nodeIndexMap.get(flow.source) || 0,
                    target: nodeIndexMap.get(flow.target) || 0,
                    value: flow.value,
                    percentage: flow.percentage
                }));
            
            return { 
                nodes, 
                links, 
                status: "available" 
            };
            
        } catch (error) {
            console.error("Error in DataTransformers.toSankeyFormat:", error);
            return { 
                nodes: [], 
                links: [], 
                status: "error" 
            };
        }
    }
    
    /**
     * Calcule le niveau hiérarchique d'un nœud (simple heuristique)
     */
    private static calculateNodeLevel(nodeId: string, flows: EnergyFlowData[]): number {
        // Les sources sans parents sont niveau 0
        const hasParent = flows.some(flow => flow.target === nodeId);
        if (!hasParent) return 0;
        
        // Calcul récursif du niveau maximum des parents + 1
        const parents = flows
            .filter(flow => flow.target === nodeId)
            .map(flow => flow.source);
            
        const maxParentLevel = Math.max(
            ...parents.map(parent => DataTransformers.calculateNodeLevel(parent, flows))
        );
        
        return maxParentLevel + 1;
    }
}

/**
 * Utilitaires pour les calculs de données énergétiques
 */
export class EnergyCalculations {
    
    /**
     * Calcule les pourcentages normalisés pour un groupe de flux
     */
    static normalizePercentages(flows: EnergyFlowData[]): EnergyFlowData[] {
        const totalValue = flows.reduce((sum, flow) => sum + flow.value, 0);
        
        if (totalValue === 0) {
            return flows.map(flow => ({ ...flow, percentage: 0 }));
        }
        
        return flows.map(flow => ({
            ...flow,
            percentage: Math.round((flow.value / totalValue) * 100 * 100) / 100 // 2 décimales
        }));
    }
    
    /**
     * Formate les valeurs selon l'unité énergétique
     */
    static formatValue(value: number, unit: string): string {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M ${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k ${unit}`;
        }
        return `${value.toFixed(1)} ${unit}`;
    }
}