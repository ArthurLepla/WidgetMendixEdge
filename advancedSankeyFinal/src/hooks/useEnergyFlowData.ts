import { useMemo } from "react";
import { ValueStatus } from "mendix";
import { AdvancedSankeyV2ContainerProps } from "../../typings/AdvancedSankeyV2Props";
import { SankeyFormattedData, EnergyFlowData } from "../types/EnergyFlow.types";

/**
 * Hook principal pour transformer les EnergyFlowNode en données D3-Sankey
 */
export function useEnergyFlowData(props: AdvancedSankeyV2ContainerProps): SankeyFormattedData {
    const { energyFlowDataSource } = props;
    
    return useMemo(() => {
        // Vérification du statut des données
        if (!energyFlowDataSource || energyFlowDataSource.status !== ValueStatus.Available) {
            return { 
                nodes: [], 
                links: [], 
                status: energyFlowDataSource?.status === ValueStatus.Loading ? "loading" : "error" 
            };
        }

        try {
            // Transformation des EnergyFlowNode en EnergyFlowData via les ListAttributeValue générés
            const flows: EnergyFlowData[] = energyFlowDataSource.items?.map(item => {
                const sourceName = props.sourceAssetAttribute?.get(item)?.value as string | undefined;
                const targetName = props.targetAssetAttribute?.get(item)?.value as string | undefined;
                const flowValue = props.flowValueAttribute?.get(item)?.value; // Big | undefined
                const percentageValue = props.percentageAttribute?.get(item)?.value; // Big | undefined

                return {
                    source: (sourceName ?? "Unknown"),
                    target: (targetName ?? "Unknown"),
                    value: Number(flowValue ? flowValue.toString() : 0),
                    percentage: Number(percentageValue ? percentageValue.toString() : 0)
                };
            }) || [];

            // Conversion vers le format D3-Sankey
            const sankeyData = transformToSankeyFormat(flows);
            
            return {
                ...sankeyData,
                status: "available"
            };
            
        } catch (error) {
            console.error("Error processing EnergyFlowNode data:", error);
            return { nodes: [], links: [], status: "error" };
        }
    }, [energyFlowDataSource]);
}

/**
 * Transforme les données de flux en format D3-Sankey
 */
function transformToSankeyFormat(flows: EnergyFlowData[]): { nodes: any[], links: any[] } {
    // Extraction des nœuds uniques
    const nodeIds = new Set<string>();
    flows.forEach(flow => {
        nodeIds.add(flow.source);
        nodeIds.add(flow.target);
    });
    
    const nodes = Array.from(nodeIds).map((id, index) => ({
        id: id,
        name: id,
        nodeIndex: index
    }));
    
    // Création de l'index des nœuds
    const nodeIndexMap = new Map<string, number>();
    nodes.forEach((node, index) => {
        nodeIndexMap.set(node.id, index);
    });
    
    // Transformation des liens
    const links = flows.map(flow => ({
        source: nodeIndexMap.get(flow.source) || 0,
        target: nodeIndexMap.get(flow.target) || 0,
        value: flow.value,
        percentage: flow.percentage
    }));
    
    return { nodes, links };
}