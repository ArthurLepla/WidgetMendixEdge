import { useState, useMemo, useCallback } from "react";
import { EnergyData, Month } from "../types/energyData";

export interface HierarchicalNode {
    id: string;
    type: "secteur" | "atelier" | "machine";
    name: string;
    data: EnergyData | null;
    children: HierarchicalNode[];
    isExpanded: boolean;
    parent?: HierarchicalNode;
    level: number;
    // Totaux calculés
    monthlyTotals: { [key: string]: number };
    yearTotal: number;
    previousMonthlyTotals?: { [key: string]: number };
    previousYearTotal?: number;
}

export const useHierarchicalData = (data: EnergyData[], months: Month[]) => {
    // État pour stocker les identifiants des nœuds expandés
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

    // Fonction pour agréger les données mensuelles
    const aggregateMonthlyValues = (items: EnergyData[], monthId: string): number => {
        return items.reduce((sum, item) => sum + (item.monthlyValues[monthId] || 0), 0);
    };

    // Fonction pour agréger les données de l'année précédente
    const aggregatePreviousMonthlyValues = (items: EnergyData[], monthId: string): number => {
        return items.reduce((sum, item) => {
            if (item.previousYearValues) {
                return sum + (item.previousYearValues[monthId] || 0);
            }
            return sum;
        }, 0);
    };

    // Créer la structure hiérarchique SANS créer de "Non défini"
    const hierarchicalData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Organiser par secteur (seulement si défini)
        const secteurMap: { [key: string]: EnergyData[] } = {};
        const orphanedBySecteur: EnergyData[] = [];

        data.forEach(item => {
            if (item.secteurName && item.secteurName.trim() !== "") {
                const secteurName = item.secteurName;
                if (!secteurMap[secteurName]) {
                    secteurMap[secteurName] = [];
                }
                secteurMap[secteurName].push(item);
            } else {
                orphanedBySecteur.push(item);
            }
        });

        // Créer les nœuds secteur valides
        const secteurNodes: HierarchicalNode[] = Object.entries(secteurMap).map(([secteurName, secteurItems]) => {
            // Organiser par atelier au sein de ce secteur (seulement si défini)
            const atelierMap: { [key: string]: EnergyData[] } = {};
            const orphanedByAtelier: EnergyData[] = [];

            secteurItems.forEach(item => {
                if (item.atelierName && item.atelierName.trim() !== "") {
                    const atelierName = item.atelierName;
                    if (!atelierMap[atelierName]) {
                        atelierMap[atelierName] = [];
                    }
                    atelierMap[atelierName].push(item);
                } else {
                    orphanedByAtelier.push(item);
                }
            });

            // Créer les nœuds atelier valides
            const atelierNodes: HierarchicalNode[] = Object.entries(atelierMap).map(([atelierName, atelierItems]) => {
                // Créer les nœuds machines pour cet atelier
                const machineNodesForAtelier: HierarchicalNode[] = atelierItems.map(item => ({
                    id: `machine-${item.id || atelierName}-${item.machineName}`,
                    type: "machine" as const,
                    name: item.machineName,
                    data: item,
                    children: [],
                    isExpanded: false,
                    level: 2,
                    monthlyTotals: item.monthlyValues,
                    yearTotal: item.yearTotal,
                    previousMonthlyTotals: item.previousYearValues,
                    previousYearTotal: item.previousYearTotal
                }));

                // Calculer les totaux pour cet atelier
                const monthlyTotals: { [key: string]: number } = {};
                const previousMonthlyTotals: { [key: string]: number } = {};

                months.forEach(month => {
                    monthlyTotals[month.id] = aggregateMonthlyValues(atelierItems, month.id);
                    previousMonthlyTotals[month.id] = aggregatePreviousMonthlyValues(atelierItems, month.id);
                });

                const yearTotal = atelierItems.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
                const previousYearTotal = atelierItems.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0);

                return {
                    id: `atelier-${secteurName}-${atelierName}`,
                    type: "atelier" as const,
                    name: atelierName,
                    data: null,
                    children: machineNodesForAtelier,
                    isExpanded: !!expandedNodes[`atelier-${secteurName}-${atelierName}`],
                    level: 1,
                    monthlyTotals,
                    yearTotal,
                    previousMonthlyTotals,
                    previousYearTotal
                };
            });

            // Ajouter les machines orphelines (sans atelier) directement au secteur
            const orphanedMachineNodes: HierarchicalNode[] = orphanedByAtelier.map(item => ({
                id: `machine-orphaned-${item.id || item.machineName}`,
                type: "machine" as const,
                name: item.machineName,
                data: item,
                children: [],
                isExpanded: false,
                level: 1, // Au niveau atelier puisqu'elles sont directement sous le secteur
                monthlyTotals: item.monthlyValues,
                yearTotal: item.yearTotal,
                previousMonthlyTotals: item.previousYearValues,
                previousYearTotal: item.previousYearTotal
            }));

            // Combiner ateliers et machines orphelines
            const allSecteurChildren = [...atelierNodes, ...orphanedMachineNodes];

            // Calculer les totaux pour ce secteur
            const monthlyTotals: { [key: string]: number } = {};
            const previousMonthlyTotals: { [key: string]: number } = {};

            months.forEach(month => {
                monthlyTotals[month.id] = aggregateMonthlyValues(secteurItems, month.id);
                previousMonthlyTotals[month.id] = aggregatePreviousMonthlyValues(secteurItems, month.id);
            });

            const yearTotal = secteurItems.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
            const previousYearTotal = secteurItems.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0);

            return {
                id: `secteur-${secteurName}`,
                type: "secteur" as const,
                name: secteurName,
                data: null,
                children: allSecteurChildren,
                isExpanded: !!expandedNodes[`secteur-${secteurName}`],
                level: 0,
                monthlyTotals,
                yearTotal,
                previousMonthlyTotals,
                previousYearTotal
            };
        });

        // Ajouter les machines complètement orphelines (sans secteur) au niveau racine
        const rootOrphanedMachines: HierarchicalNode[] = orphanedBySecteur.map(item => ({
            id: `machine-root-orphaned-${item.id || item.machineName}`,
            type: "machine" as const,
            name: item.machineName,
            data: item,
            children: [],
            isExpanded: false,
            level: 0, // Au niveau racine
            monthlyTotals: item.monthlyValues,
            yearTotal: item.yearTotal,
            previousMonthlyTotals: item.previousYearValues,
            previousYearTotal: item.previousYearTotal
        }));

        // Combiner secteurs et machines orphelines racine
        return [...secteurNodes, ...rootOrphanedMachines];
    }, [data, months, expandedNodes]);

    // Fonction pour développer/réduire un nœud
    const toggleNodeExpansion = useCallback((nodeId: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    }, []);

    // Fonction pour développer tous les nœuds
    const expandAllNodes = useCallback(() => {
        const allNodes: { [key: string]: boolean } = {};

        // Fonction récursive pour collecter tous les identifiants de nœuds
        const collectNodeIds = (nodes: HierarchicalNode[]) => {
            nodes.forEach(node => {
                allNodes[node.id] = true;
                if (node.children.length > 0) {
                    collectNodeIds(node.children);
                }
            });
        };

        collectNodeIds(hierarchicalData);
        setExpandedNodes(allNodes);
    }, [hierarchicalData]);

    // Fonction pour réduire tous les nœuds
    const collapseAllNodes = useCallback(() => {
        setExpandedNodes({});
    }, []);

    // Fonction pour obtenir les nœuds aplatis selon leur état d'expansion
    const getFlattenedNodes = useCallback(() => {
        const flattened: HierarchicalNode[] = [];

        // Fonction récursive pour aplatir les nœuds
        const flattenNodes = (nodes: HierarchicalNode[], isParentExpanded = true) => {
            nodes.forEach(node => {
                // Ajouter ce nœud si le parent est développé
                if (isParentExpanded) {
                    flattened.push({
                        ...node,
                        isExpanded: !!expandedNodes[node.id]
                    });
                }

                // Ajouter les enfants si ce nœud est développé
                if (expandedNodes[node.id] && isParentExpanded) {
                    flattenNodes(node.children, true);
                }
            });
        };

        flattenNodes(hierarchicalData, true);
        return flattened;
    }, [hierarchicalData, expandedNodes]);

    // Fonction pour obtenir TOUS les nœuds en mode complètement étendu (pour l'export)
    const getAllExpandedNodes = useCallback(() => {
        const allNodes: HierarchicalNode[] = [];

        // Fonction récursive pour aplatir TOUS les nœuds
        const flattenAllNodes = (nodes: HierarchicalNode[]) => {
            nodes.forEach(node => {
                allNodes.push(node);
                if (node.children.length > 0) {
                    flattenAllNodes(node.children);
                }
            });
        };

        flattenAllNodes(hierarchicalData);
        return allNodes;
    }, [hierarchicalData]);

    // Fonction pour déplier automatiquement les nœuds contenant des résultats de recherche
    const expandNodesForSearch = useCallback(
        (searchTerm: string) => {
            if (!searchTerm || searchTerm.trim() === "") {
                return; // Ne rien faire si pas de recherche
            }

            const searchLower = searchTerm.toLowerCase();
            const nodesToExpand: { [key: string]: boolean } = { ...expandedNodes };

            // Fonction récursive pour trouver les nœuds qui matchent et déplier leurs parents
            const findAndExpandMatches = (nodes: HierarchicalNode[], parentIds: string[] = []) => {
                nodes.forEach(node => {
                    const nodeMatches = node.name.toLowerCase().includes(searchLower);

                    // Si ce nœud matche, déplier tous ses parents
                    if (nodeMatches) {
                        parentIds.forEach(parentId => {
                            nodesToExpand[parentId] = true;
                        });
                    }

                    // Continuer la recherche dans les enfants
                    if (node.children.length > 0) {
                        findAndExpandMatches(node.children, [...parentIds, node.id]);
                    }
                });
            };

            findAndExpandMatches(hierarchicalData);
            setExpandedNodes(nodesToExpand);
        },
        [hierarchicalData, expandedNodes]
    );

    return {
        hierarchicalData,
        expandedNodes,
        toggleNodeExpansion,
        expandAllNodes,
        collapseAllNodes,
        getFlattenedNodes,
        getAllExpandedNodes,
        expandNodesForSearch
    };
};
