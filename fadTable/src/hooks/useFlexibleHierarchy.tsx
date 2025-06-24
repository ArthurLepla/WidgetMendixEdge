import { useState, useMemo, useCallback } from "react";
import { EnergyData, Month } from "../types/energyData";
import {
    FlexibleHierarchyConfig,
    FlexibleHierarchicalNode,
    extractHierarchyConfig,
    convertLegacyToFlexible,
    isLegacyMode
} from "../types/hierarchyConfig";
import { FadTableContainerProps } from "../../typings/FadTableProps";

/**
 * Hook pour gérer une hiérarchie flexible avec x niveaux
 * Supporte de 1 à 10 niveaux hiérarchiques configurables
 */
export const useFlexibleHierarchy = (data: EnergyData[], months: Month[], props: FadTableContainerProps) => {
    // État des nœuds développés/repliés
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

    // Configuration de la hiérarchie
    const hierarchyConfig: FlexibleHierarchyConfig = useMemo(() => {
        if (isLegacyMode(props)) {
            return convertLegacyToFlexible(props);
        }
        return extractHierarchyConfig(props);
    }, [props]);

    // Fonction récursive pour construire la hiérarchie CORRIGÉE
    const buildHierarchyLevel = useCallback(
        (items: EnergyData[], levelIndex: number, parentId: string = ""): FlexibleHierarchicalNode[] => {
            if (levelIndex >= hierarchyConfig.levels.length) {
                // Cas terminal : créer les nœuds feuilles (machines/capteurs)
                return items.map(item => {
                    // Accéder aux données via les propriétés de l'objet EnergyData transformé
                    let leafValue: string;

                    try {
                        // Essayer d'abord via les propriétés transformées
                        leafValue = item.machineName;

                        // Si pas trouvé dans les données transformées, essayer l'attribut Mendix original si disponible
                        if (!leafValue && item.originalMendixObject && hierarchyConfig.leafNodeAttribute) {
                            const mendixValue = hierarchyConfig.leafNodeAttribute.get(item.originalMendixObject);
                            
                            // Extraction sécurisée de la valeur Mendix
                            if (mendixValue !== null && mendixValue !== undefined) {
                                if (typeof mendixValue === 'string') {
                                    leafValue = mendixValue;
                                } else if (typeof mendixValue === 'object') {
                                    // Objet Mendix - essayer différentes propriétés
                                    if (mendixValue.value !== undefined) {
                                        leafValue = String(mendixValue.value);
                                    } else if (mendixValue.displayValue !== undefined) {
                                        leafValue = String(mendixValue.displayValue);
                                    } else if (typeof mendixValue.toString === 'function') {
                                        const stringValue = mendixValue.toString();
                                        leafValue = stringValue !== '[object Object]' ? stringValue : "Non défini";
                                    }
                                } else {
                                    leafValue = String(mendixValue);
                                }
                            }
                        }

                        leafValue = leafValue || "Non défini";
                    } catch (error) {
                        console.warn(`[useFlexibleHierarchy] Error accessing leaf node value:`, error);
                        leafValue = "Non défini";
                    }

                    console.log(`[DEBUG createHierarchicalNode] Creating leaf node:`, {
                        leafValue,
                        parentId,
                        finalId: `leaf--${leafValue}`
                    });

                    return {
                        id: `leaf--${leafValue}`,
                        levelId: "leaf",
                        levelIndex,
                        levelName: hierarchyConfig.leafNodeName,
                        name: leafValue,
                        data: item,
                        children: [],
                        isExpanded: false,
                        styles: {
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                            fontWeight: 400
                        },
                        monthlyTotals: item.monthlyValues,
                        yearTotal: item.yearTotal,
                        previousMonthlyTotals: item.previousYearValues,
                        previousYearTotal: item.previousYearTotal
                    };
                });
            }

            const currentLevel = hierarchyConfig.levels[levelIndex];

            // Grouper par la valeur de l'attribut du niveau actuel
            const grouped: { [key: string]: EnergyData[] } = {};
            const orphanItems: EnergyData[] = []; // Éléments sans valeur pour ce niveau

            items.forEach(item => {
                // Accéder aux données via les propriétés de l'item EnergyData transformé
                let levelValue: string | undefined;

                try {
                    // Essayer d'abord via les propriétés transformées
                    switch (currentLevel.id) {
                        case "level_1":
                            levelValue = item.secteurName || item.niveau1Name;
                            break;
                        case "level_2":
                            levelValue = item.atelierName || item.niveau2Name;
                            break;
                        case "level_3":
                            levelValue = item.machineName || item.niveau3Name;
                            break;
                        default:
                            // Pour les niveaux supplémentaires, utiliser les propriétés dynamiques
                            const levelIdx = parseInt(currentLevel.id.replace("level_", ""));
                            levelValue = (item as any)[`niveau${levelIdx}Name`];
                            break;
                    }

                    // Si pas trouvé dans les données transformées, essayer l'attribut Mendix original si disponible
                    if (!levelValue && item.originalMendixObject && currentLevel.attribute) {
                        const mendixValue = currentLevel.attribute.get(item.originalMendixObject);
                        console.log(`[DEBUG] Raw Mendix value for ${currentLevel.name}:`, {
                            mendixValue,
                            type: typeof mendixValue,
                            value: mendixValue?.value,
                            toString: mendixValue?.toString()
                        });
                        
                        // Extraction sécurisée de la valeur Mendix
                        if (mendixValue !== null && mendixValue !== undefined) {
                            if (typeof mendixValue === 'string') {
                                levelValue = mendixValue;
                            } else if (typeof mendixValue === 'object') {
                                // Objet Mendix - essayer différentes propriétés
                                if (mendixValue.value !== undefined) {
                                    levelValue = String(mendixValue.value);
                                } else if (mendixValue.displayValue !== undefined) {
                                    levelValue = String(mendixValue.displayValue);
                                } else if (typeof mendixValue.toString === 'function') {
                                    const stringValue = mendixValue.toString();
                                    levelValue = stringValue !== '[object Object]' ? stringValue : undefined;
                                }
                            } else {
                                levelValue = String(mendixValue);
                            }
                        }
                        
                        console.log(`[DEBUG] Extracted levelValue for ${currentLevel.name}:`, levelValue);
                    }
                } catch (error) {
                    console.warn(`[useFlexibleHierarchy] Error accessing level value for ${currentLevel.name}:`, error);
                    levelValue = undefined;
                }

                if (levelValue && levelValue.trim() !== "") {
                    const key = levelValue.trim();
                    if (!grouped[key]) {
                        grouped[key] = [];
                    }
                    grouped[key].push(item);
                } else {
                    // Collecter les orphelins pour traitement spécial
                    orphanItems.push(item);
                }
            });

            // NOUVELLE LOGIQUE : Détecter et éviter les doublons terminal/niveau
            // Si c'est le dernier niveau et qu'il n'y a qu'un seul groupe, vérifier s'il faut créer un niveau intermédiaire
            const isLastLevel = levelIndex === hierarchyConfig.levels.length - 1;
            
            // Créer les nœuds pour ce niveau
            const levelNodes: FlexibleHierarchicalNode[] = Object.entries(grouped).map(([levelValue, levelItems]) => {
                // S'assurer que levelValue est une chaîne sûre pour les IDs
                const safeLevelValue = typeof levelValue === 'string' ? levelValue : String(levelValue);
                console.log(`[DEBUG] Creating node with safeLevelValue:`, safeLevelValue);
                
                // VÉRIFICATION ANTI-DOUBLON : si c'est le dernier niveau et qu'il n'y a qu'un seul élément
                // avec la même valeur pour ce niveau et pour l'élément terminal, créer directement l'élément terminal
                if (isLastLevel && levelItems.length === 1) {
                    const singleItem = levelItems[0];
                    
                    // Extraire la valeur de l'élément terminal
                    let terminalValue: string;
                    try {
                        terminalValue = singleItem.machineName;
                        
                        if (!terminalValue && singleItem.originalMendixObject && hierarchyConfig.leafNodeAttribute) {
                            const mendixValue = hierarchyConfig.leafNodeAttribute.get(singleItem.originalMendixObject);
                            if (mendixValue !== null && mendixValue !== undefined) {
                                if (typeof mendixValue === 'string') {
                                    terminalValue = mendixValue;
                                } else if (typeof mendixValue === 'object') {
                                    if (mendixValue.value !== undefined) {
                                        terminalValue = String(mendixValue.value);
                                    } else if (mendixValue.displayValue !== undefined) {
                                        terminalValue = String(mendixValue.displayValue);
                                    } else if (typeof mendixValue.toString === 'function') {
                                        const stringValue = mendixValue.toString();
                                        terminalValue = stringValue !== '[object Object]' ? stringValue : "Non défini";
                                    }
                                } else {
                                    terminalValue = String(mendixValue);
                                }
                            }
                        }
                        
                        terminalValue = terminalValue || "Non défini";
                    } catch (error) {
                        terminalValue = "Non défini";
                    }
                    
                    // Si les valeurs sont identiques, créer directement l'élément terminal
                    if (safeLevelValue === terminalValue) {
                        console.log(`[DEBUG] Évitement doublon détecté: ${safeLevelValue} === ${terminalValue}, création directe du terminal`);
                        
                        return {
                            id: `leaf--${terminalValue}`,
                            levelId: "leaf",
                            levelIndex: levelIndex + 1, // Index suivant comme si c'était le terminal
                            levelName: hierarchyConfig.leafNodeName,
                            name: terminalValue,
                            data: singleItem,
                            children: [],
                            isExpanded: false,
                            styles: {
                                backgroundColor: "#ffffff",
                                borderColor: "#e2e8f0",
                                borderWidth: 2,
                                fontWeight: 400
                            },
                            monthlyTotals: singleItem.monthlyValues,
                            yearTotal: singleItem.yearTotal,
                            previousMonthlyTotals: singleItem.previousYearValues,
                            previousYearTotal: singleItem.previousYearTotal
                        };
                    }
                }
                
                // Logique normale : créer le niveau intermédiaire
                const nodeId = `${currentLevel.id}--${safeLevelValue}`;
                const children = buildHierarchyLevel(levelItems, levelIndex + 1, nodeId);

                // Calculer les totaux pour ce nœud
                const monthlyTotals: { [key: string]: number } = {};
                const previousMonthlyTotals: { [key: string]: number } = {};

                months.forEach(month => {
                    monthlyTotals[month.id] = levelItems.reduce(
                        (sum, item) => sum + (item.monthlyValues[month.id] || 0),
                        0
                    );

                    previousMonthlyTotals[month.id] = levelItems.reduce(
                        (sum, item) => sum + ((item.previousYearValues && item.previousYearValues[month.id]) || 0),
                        0
                    );
                });

                const yearTotal = levelItems.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
                const previousYearTotal = levelItems.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0);

                return {
                    id: nodeId,
                    levelId: currentLevel.id,
                    levelIndex,
                    levelName: currentLevel.name,
                    name: safeLevelValue,
                    data: null,
                    children,
                    isExpanded: !!expandedNodes[nodeId],
                    styles: {
                        backgroundColor: "#f8fafc",
                        borderColor: currentLevel.color,
                        borderWidth: Math.max(4 - levelIndex, 1),
                        fontWeight: Math.max(700 - levelIndex * 100, 400)
                    },
                    monthlyTotals,
                    yearTotal,
                    previousMonthlyTotals,
                    previousYearTotal
                };
            });

            // Traitement des orphelins : si on a des éléments sans valeur pour ce niveau,
            // créer les niveaux suivants directement SEULEMENT si ce niveau n'est PAS requis
            if (orphanItems.length > 0) {
                if (!currentLevel.isRequired) {
                    // Si le niveau n'est pas requis, passer directement au niveau suivant
                    const orphanChildren = buildHierarchyLevel(orphanItems, levelIndex + 1, parentId);
                    levelNodes.push(...orphanChildren);
                } else {
                    // Si le niveau est requis, créer un groupe "non spécifié"
                    const fallbackKey = `${currentLevel.name} non spécifié`;
                    console.log(`[DEBUG] Creating fallback group for required level: ${fallbackKey}`);
                    
                    const nodeId = `${currentLevel.id}--${fallbackKey}`;
                    const children = buildHierarchyLevel(orphanItems, levelIndex + 1, nodeId);

                    // Calculer les totaux pour ce nœud
                    const monthlyTotals: { [key: string]: number } = {};
                    const previousMonthlyTotals: { [key: string]: number } = {};

                    months.forEach(month => {
                        monthlyTotals[month.id] = orphanItems.reduce(
                            (sum, item) => sum + (item.monthlyValues[month.id] || 0),
                            0
                        );

                        previousMonthlyTotals[month.id] = orphanItems.reduce(
                            (sum, item) => sum + ((item.previousYearValues && item.previousYearValues[month.id]) || 0),
                            0
                        );
                    });

                    const yearTotal = orphanItems.reduce((sum, item) => sum + (item.yearTotal || 0), 0);
                    const previousYearTotal = orphanItems.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0);

                    levelNodes.push({
                        id: nodeId,
                        levelId: currentLevel.id,
                        levelIndex,
                        levelName: currentLevel.name,
                        name: fallbackKey,
                        data: null,
                        children,
                        isExpanded: !!expandedNodes[nodeId],
                        styles: {
                            backgroundColor: "#fef2f2",
                            borderColor: "#fca5a5",
                            borderWidth: Math.max(4 - levelIndex, 1),
                            fontWeight: Math.max(700 - levelIndex * 100, 400)
                        },
                        monthlyTotals,
                        yearTotal,
                        previousMonthlyTotals,
                        previousYearTotal
                    });
                }
            }

            return levelNodes;
        },
        [data, months, hierarchyConfig, expandedNodes]
    );

    // Construire la hiérarchie complète
    const hierarchicalData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return buildHierarchyLevel(data, 0);
    }, [data, buildHierarchyLevel]);

    // Fonction pour développer/réduire un nœud
    const toggleNodeExpansion = useCallback((nodeId: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    }, []);

    // Fonction pour développer tous les nœuds
    const expandAllNodes = useCallback(() => {
        const allNodeIds: { [key: string]: boolean } = {};

        const collectNodeIds = (nodes: FlexibleHierarchicalNode[]) => {
            nodes.forEach(node => {
                if (node.children.length > 0) {
                    allNodeIds[node.id] = true;
                    collectNodeIds(node.children);
                }
            });
        };

        collectNodeIds(hierarchicalData);
        setExpandedNodes(allNodeIds);
    }, [hierarchicalData]);

    // Fonction pour réduire tous les nœuds
    const collapseAllNodes = useCallback(() => {
        setExpandedNodes({});
    }, []);

    // Obtenir la liste aplatie des nœuds visibles
    const getFlattenedNodes = useCallback((): FlexibleHierarchicalNode[] => {
        const flattened: FlexibleHierarchicalNode[] = [];

        const traverse = (nodes: FlexibleHierarchicalNode[]) => {
            nodes.forEach(node => {
                flattened.push(node);
                if (node.children.length > 0 && expandedNodes[node.id]) {
                    traverse(node.children);
                }
            });
        };

        traverse(hierarchicalData);
        return flattened;
    }, [hierarchicalData, expandedNodes]);

    // Obtenir tous les nœuds (pour export)
    const getAllExpandedNodes = useCallback((): FlexibleHierarchicalNode[] => {
        const allNodes: FlexibleHierarchicalNode[] = [];

        const traverse = (nodes: FlexibleHierarchicalNode[]) => {
            nodes.forEach(node => {
                allNodes.push(node);
                if (node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };

        traverse(hierarchicalData);
        return allNodes;
    }, [hierarchicalData]);

    // Développer les nœuds pour la recherche
    const expandNodesForSearch = useCallback(
        (searchTerm: string) => {
            const nodesToExpand: { [key: string]: boolean } = {};

            const searchAndExpand = (nodes: FlexibleHierarchicalNode[]): boolean => {
                let foundMatch = false;

                nodes.forEach(node => {
                    const nameMatches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const childrenMatch = node.children.length > 0 && searchAndExpand(node.children);

                    if (nameMatches || childrenMatch) {
                        nodesToExpand[node.id] = true;
                        foundMatch = true;
                    }
                });

                return foundMatch;
            };

            searchAndExpand(hierarchicalData);
            setExpandedNodes(prev => ({ ...prev, ...nodesToExpand }));
        },
        [hierarchicalData]
    );

    const createHierarchicalNode = useCallback(
        (
            id: string,
            name: any,
            levelId: string,
            levelIndex: number,
            data: EnergyData[] = [],
            children: FlexibleHierarchicalNode[] = []
        ): FlexibleHierarchicalNode => {
            console.log(`[DEBUG createHierarchicalNode] Creating node:`, {
                id,
                name,
                nameType: typeof name,
                levelId,
                levelIndex,
                dataCount: data.length,
                childrenCount: children.length
            });

            // Fonction pour convertir le nom de manière sûre
            const safeName = (() => {
                if (name === null || name === undefined) {
                    console.warn(`[DEBUG] Nom null/undefined pour node ${id}`);
                    return 'Nom non défini';
                }
                
                if (typeof name === 'string') {
                    return name;
                }
                
                if (typeof name === 'number') {
                    return name.toString();
                }
                
                if (typeof name === 'object') {
                    console.error(`[DEBUG] PROBLÈME - Nom est un objet pour node ${id}:`, {
                        name,
                        keys: Object.keys(name),
                        toString: name?.toString(),
                        valueOf: name?.valueOf ? name.valueOf() : 'no valueOf',
                        constructor: name?.constructor?.name
                    });
                    
                    // Tentative d'extraction pour objets Mendix
                    if (name.get && typeof name.get === 'function') {
                        try {
                            const mendixValue = name.get();
                            console.log(`[DEBUG] Valeur Mendix extraite: ${mendixValue}`);
                            return mendixValue || 'Valeur Mendix vide';
                        } catch (e) {
                            console.error('Erreur extraction Mendix:', e);
                            return 'Erreur Mendix';
                        }
                    }
                    
                    // Autres propriétés
                    if (name.value !== undefined) return String(name.value);
                    if (name.displayValue !== undefined) return String(name.displayValue);
                    if (name.name !== undefined) return String(name.name);
                    
                    // Dernière tentative
                    const jsonStr = JSON.stringify(name);
                    return jsonStr !== '{}' ? `Objet: ${jsonStr}` : 'Objet vide';
                }
                
                return String(name);
            })();

            console.log(`[DEBUG] Nom final pour node ${id}: "${safeName}"`);

            return {
                id,
                levelId,
                levelIndex,
                levelName: hierarchyConfig.levels[levelIndex].name,
                name: safeName,
                data,
                children,
                isExpanded: false,
                styles: {
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderWidth: 2,
                    fontWeight: 400
                },
                monthlyTotals: data.reduce((totals, item) => ({ ...totals, ...item.monthlyValues }), {}),
                yearTotal: data.reduce((sum, item) => sum + (item.yearTotal || 0), 0),
                previousMonthlyTotals: data.reduce((totals, item) => ({ ...totals, ...item.previousYearValues }), {}),
                previousYearTotal: data.reduce((sum, item) => sum + (item.previousYearTotal || 0), 0)
            };
        },
        [hierarchyConfig]
    );

    return {
        hierarchyConfig,
        hierarchicalData,
        expandedNodes,
        toggleNodeExpansion,
        expandAllNodes,
        collapseAllNodes,
        getFlattenedNodes,
        getAllExpandedNodes,
        expandNodesForSearch,
        createHierarchicalNode
    };
};
