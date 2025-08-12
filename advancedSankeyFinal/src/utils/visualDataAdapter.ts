import { AdvancedSankeyV2ContainerProps } from "../../typings/AdvancedSankeyV2Props";
import { ValueStatus } from "mendix";
import { EnergyFlowData } from "../types/EnergyFlow.types";
import { ENERGY_CONFIGS, ENERGY_ICONS } from "./colorMapping";

/**
 * Adaptateur pour transformer les EnergyFlowNode vers le format visuel existant
 * CONSERVE EXACTEMENT la structure visuelle et les classes CSS existantes
 */
export interface VisualSankeyData {
    nodes: VisualNode[];
    links: VisualLink[];
    status: "loading" | "available" | "error";
    energyConfig: {
        color: string;
        title: string;
        unit: string;
        icon?: any;
    };
    metadata: {
        totalValue: number;
        nodeCount: number;
        linkCount: number;
    };
}

export interface VisualNode {
    id: string;
    name: string;
    value: number;
    level: number;
    color: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    // Propriétés pour la compatibilité avec l'ancien système
    levelName?: string;
    parentName?: string;
    children?: string[];
}

export interface VisualLink {
    source: number | string;
    target: number | string;
    value: number;
    percentage: number;
    color: string;
    width?: number;
    // Propriétés pour les tooltips
    sourceName?: string;
    targetName?: string;
}

/**
 * Classe principale d'adaptation des données visuelles
 */
export class VisualDataAdapter {
    
    /**
     * Transforme les EnergyFlowNode vers le format visuel existant
     * Preserve exactement la structure attendue par les composants visuels
     */
    static transformToVisualFormat(props: AdvancedSankeyV2ContainerProps): VisualSankeyData {
        try {
            // Récupération de la configuration énergétique
            const baseEnergyConfig = ENERGY_CONFIGS[props.energyType || "elec"];
            const IconComponent = ENERGY_ICONS[props.energyType || "elec"];
            const energyConfig = { ...baseEnergyConfig, icon: IconComponent };
            
            // Vérification du statut des données
            if (!props.energyFlowDataSource || props.energyFlowDataSource.status !== ValueStatus.Available) {
                return {
                    nodes: [],
                    links: [],
                    status: props.energyFlowDataSource?.status === ValueStatus.Loading ? "loading" : "error",
                    energyConfig,
                    metadata: { totalValue: 0, nodeCount: 0, linkCount: 0 }
                };
            }

            // Transformation des EnergyFlowNode en flux de données
            const flowData = this.extractFlowData(props);
            
            // Création des nœuds visuels (même structure que l'ancien système)
            const visualNodes = this.createVisualNodes(flowData, energyConfig);
            
            // Création des liens visuels (même structure que l'ancien système)
            const visualLinks = this.createVisualLinks(flowData, visualNodes, energyConfig);
            
            // Calcul des métadonnées
            const metadata = this.calculateMetadata(visualNodes, visualLinks);
            
            return {
                nodes: visualNodes,
                links: visualLinks,
                status: "available",
                energyConfig,
                metadata
            };
            
        } catch (error) {
            console.error("Error in VisualDataAdapter.transformToVisualFormat:", error);
            return {
                nodes: [],
                links: [],
                status: "error",
                energyConfig: ENERGY_CONFIGS.elec,
                metadata: { totalValue: 0, nodeCount: 0, linkCount: 0 }
            };
        }
    }
    
    /**
     * Extrait les données de flux depuis les EnergyFlowNode
     */
    private static extractFlowData(props: AdvancedSankeyV2ContainerProps): EnergyFlowData[] {
        const items = props.energyFlowDataSource?.items ?? [];

        return items.map(item => {
            const sourceName = props.sourceAssetAttribute?.get(item)?.value as string | undefined;
            const targetName = props.targetAssetAttribute?.get(item)?.value as string | undefined;
            const flowValue = props.flowValueAttribute?.get(item)?.value; // Big | undefined
            const percentageValue = props.percentageAttribute?.get(item)?.value; // Big | undefined

            return {
                source: (sourceName ?? "Unknown Source").toString(),
                target: (targetName ?? "Unknown Target").toString(),
                value: Number(flowValue ? flowValue.toString() : 0),
                percentage: Number(percentageValue ? percentageValue.toString() : 0)
            } as EnergyFlowData;
        });
    }
    
    /**
     * Crée les nœuds visuels avec la même structure que l'ancien système
     */
    private static createVisualNodes(flowData: EnergyFlowData[], energyConfig: any): VisualNode[] {
        // Extraction des noms de nœuds uniques
        const nodeNames = new Set<string>();
        flowData.forEach(flow => {
            nodeNames.add(flow.source);
            nodeNames.add(flow.target);
        });
        
        // Création des nœuds avec calcul des niveaux hiérarchiques
        const nodes: VisualNode[] = Array.from(nodeNames).map(name => {
            const level = this.calculateNodeLevel(name, flowData);
            const value = this.calculateNodeValue(name, flowData);
            
            return {
                id: name,
                name: name,
                value: value,
                level: level,
                color: this.getNodeColor(name, level, energyConfig),
                levelName: this.getLevelName(level),
                children: this.getNodeChildren(name, flowData)
            };
        });
        
        // Tri par niveau puis par valeur (pour un affichage cohérent)
        return nodes.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return b.value - a.value;
        });
    }
    
    /**
     * Crée les liens visuels avec la même structure que l'ancien système
     */
    private static createVisualLinks(flowData: EnergyFlowData[], nodes: VisualNode[], energyConfig: any): VisualLink[] {
        const nodeIndexMap = new Map<string, number>();
        nodes.forEach((node, index) => {
            nodeIndexMap.set(node.id, index);
        });
        
        return flowData
            .filter(flow => flow.value > 0) // Filtrer les flux vides
            .map(flow => ({
                source: nodeIndexMap.get(flow.source) || 0,
                target: nodeIndexMap.get(flow.target) || 0,
                value: flow.value,
                percentage: flow.percentage,
                color: energyConfig.color,
                sourceName: flow.source,
                targetName: flow.target
            }));
    }
    
    /**
     * Calcule le niveau hiérarchique d'un nœud (0 = racine)
     */
    private static calculateNodeLevel(nodeName: string, flowData: EnergyFlowData[]): number {
        const hasParent = flowData.some(flow => flow.target === nodeName);
        if (!hasParent) return 0;
        
        // Calcul récursif du niveau maximum des parents + 1
        const parents = flowData
            .filter(flow => flow.target === nodeName)
            .map(flow => flow.source);
            
        const maxParentLevel = Math.max(
            ...parents.map(parent => this.calculateNodeLevel(parent, flowData))
        );
        
        return maxParentLevel + 1;
    }
    
    /**
     * Calcule la valeur totale d'un nœud
     */
    private static calculateNodeValue(nodeName: string, flowData: EnergyFlowData[]): number {
        // Pour les nœuds sources (niveau 0), utiliser la somme des flux sortants
        const outgoingFlows = flowData.filter(flow => flow.source === nodeName);
        if (outgoingFlows.length > 0) {
            return outgoingFlows.reduce((sum, flow) => sum + flow.value, 0);
        }
        
        // Pour les nœuds cibles, utiliser la somme des flux entrants
        const incomingFlows = flowData.filter(flow => flow.target === nodeName);
        return incomingFlows.reduce((sum, flow) => sum + flow.value, 0);
    }
    
    /**
     * Détermine la couleur d'un nœud selon son niveau (comme l'ancien système)
     */
    private static getNodeColor(nodeName: string, level: number, energyConfig: any): string {
        // Mapping des couleurs par niveau (préserve l'ancien système)
        const levelColors = {
            0: "#2196F3",    // Bleu - Usine
            1: "#4CAF50",    // Vert - Atelier
            2: "#FF9800",    // Orange - Machine
            3: "#9C27B0",    // Violet - Sous-composants
        };
        
        return levelColors[level as keyof typeof levelColors] || energyConfig.color;
    }
    
    /**
     * Détermine le nom du niveau (pour la navigation breadcrumb)
     */
    private static getLevelName(level: number): string {
        const levelNames = {
            0: "Usine",
            1: "Atelier", 
            2: "Machine",
            3: "Composant"
        };
        
        return levelNames[level as keyof typeof levelNames] || `Niveau ${level}`;
    }
    
    /**
     * Trouve les enfants directs d'un nœud
     */
    private static getNodeChildren(nodeName: string, flowData: EnergyFlowData[]): string[] {
        return flowData
            .filter(flow => flow.source === nodeName)
            .map(flow => flow.target);
    }
    
    /**
     * Calcule les métadonnées pour le debug et l'affichage
     */
    private static calculateMetadata(nodes: VisualNode[], links: VisualLink[]) {
        const totalValue = nodes.reduce((sum, node) => sum + node.value, 0);
        
        return {
            totalValue,
            nodeCount: nodes.length,
            linkCount: links.length
        };
    }
}