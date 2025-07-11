import { useState, useEffect } from "react";
import { ValueStatus, ObjectItem } from "mendix";
import { ProcessedDataItem, DataPreview, ComponentStep } from "../types/widget";
import { parseNumericValue } from "../utils/formatting";
import { addIfRelevant, collectItemsByType } from "../utils/calculations";

/**
 * Hook simplifié pour traiter les données et construire l'arbre hiérarchique
 * 
 * Se déclenche automatiquement quand :
 * - currentStep === "fetchingInitialData" ET toutes les sources sont disponibles
 * - currentStep === "processingPdfData" 
 */
export function useDataProcessing(
    reportLevels: any[],
    currentStep: ComponentStep,
    onDataProcessed: (hasData: boolean) => void,
    onError: (message: string) => void
) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [treeData, setTreeData] = useState<ProcessedDataItem[]>([]);
    const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);

    // Auto-transition de fetchingInitialData vers processingPdfData
    useEffect(() => {
        if (currentStep !== "fetchingInitialData") return;

        const allSourcesReady = reportLevels.every(
            level => level.levelEntitySource?.status === ValueStatus.Available
        );

        if (allSourcesReady) {
            console.log("PDFReportWidget: Sources prêtes, transition automatique vers traitement");
            // Notifier le FSM de passer à l'étape suivante
            // Cette transition sera gérée par le composant parent
            setTimeout(() => {
                // Petit délai pour éviter les updates simultanés
                onDataProcessed(false); // Signal de transition (pas encore de données)
            }, 100);
        } else {
            console.log("PDFReportWidget: Attente des sources de données...");
        }
    }, [currentStep, reportLevels.map(l => l.levelEntitySource?.status).join("|"), onDataProcessed]);

    // Traitement principal des données
    useEffect(() => {
        // Ne traiter que si on est dans l'état processingPdfData
        if (currentStep !== "processingPdfData") {
            return;
        }

        console.log("PDFReportWidget: Début du traitement des données");
        setIsLoading(true);
        setTreeData([]);
        setDataPreview(null);

        // Validation de la configuration
        const allLevelsConfigured = reportLevels.every(
            level => level.levelEntitySource && level.levelDisplayNameAttribute
        );

        if (!allLevelsConfigured || reportLevels.length === 0) {
            console.error("PDFReportWidget: Configuration des niveaux incomplète");
            setIsLoading(false);
            onError("Configuration incomplète des niveaux de données");
            return;
        }

        // Traitement asynchrone des données
        processAllLevels()
            .then(processedData => {
                const { treeData: newTreeData, preview } = processedData;
                
                setTreeData(newTreeData);
                setDataPreview(preview);
                setIsLoading(false);
                
                const hasData = newTreeData.length > 0;
                console.log(`PDFReportWidget: Traitement terminé - ${hasData ? 'données trouvées' : 'aucune donnée'}`);
                
                // Notifier le FSM du résultat
                onDataProcessed(hasData);
            })
            .catch(error => {
                console.error("PDFReportWidget: Erreur durant le traitement:", error);
                setIsLoading(false);
                setTreeData([]);
                setDataPreview(null);
                onError("Erreur lors du traitement des données");
            });

    }, [currentStep, reportLevels, onDataProcessed, onError]);

    /**
     * Traite tous les niveaux et construit l'arbre hiérarchique
     */
    const processAllLevels = async (): Promise<{ treeData: ProcessedDataItem[], preview: DataPreview }> => {
        const allItems: ProcessedDataItem[] = [];

        // Traitement de chaque niveau
        for (const [levelIndex, levelConfig] of reportLevels.entries()) {
            const levelItems = await processLevel(levelConfig, levelIndex);
            allItems.push(...levelItems);
        }

        console.log(`PDFReportWidget: ${allItems.length} éléments traités au total`);

        if (allItems.length === 0) {
            return {
                treeData: [],
                preview: { secteurs: 0, ateliers: 0, machines: 0 }
            };
        }

        // Construction de l'arbre hiérarchique
        const treeData = buildHierarchicalTree(allItems, reportLevels);
        
        // Calcul de la preview
        const preview: DataPreview = {
            secteurs: collectItemsByType(treeData, "Secteur").length,
            ateliers: collectItemsByType(treeData, "Atelier").length,
            machines: collectItemsByType(treeData, "Machine").length
        };

        return { treeData, preview };
    };

    /**
     * Traite un niveau spécifique
     */
    const processLevel = async (levelConfig: any, levelIndex: number): Promise<ProcessedDataItem[]> => {
        const { levelEntitySource } = levelConfig;

        if (levelEntitySource.status !== ValueStatus.Available) {
            console.warn(`PDFReportWidget: Niveau ${levelIndex} non disponible`);
            return [];
        }

        const items = levelEntitySource.items || [];
        console.log(`PDFReportWidget: Traitement de ${items.length} éléments pour le niveau ${levelIndex}`);

        return items
            .map((item: ObjectItem) => processItem(item, levelConfig, levelIndex))
            .filter((processedItem: ProcessedDataItem | null): processedItem is ProcessedDataItem => processedItem !== null);
    };

    /**
     * Traite un élément individuel
     */
    const processItem = (item: ObjectItem, levelConfig: any, levelIndex: number): ProcessedDataItem | null => {
        const {
            levelDisplayNameAttribute,
            levelTypeIdentifier,
            parent1LevelDescription,
            parent1NameFromAttribute,
            parent2LevelDescription,
            parent2NameFromAttribute,
            consumptionDataSourceType,
            singleTotalConsumptionAttribute,
            energyTypeAttribute,
            consoElecAttribute,
            consoGazAttribute,
            consoAirAttribute,
            productionAttribute,
            isElecRelevantAttribute,
            isGazRelevantAttribute,
            isAirRelevantAttribute
        } = levelConfig;

        const displayName = levelDisplayNameAttribute.get(item).value || "N/A";
        
        // Construction des parents
        const parents: { [description: string]: string } = {};
        if (parent1LevelDescription && parent1NameFromAttribute) {
            parents[parent1LevelDescription] = parent1NameFromAttribute.get(item).value || "-";
        }
        if (parent2LevelDescription && parent2NameFromAttribute) {
            parents[parent2LevelDescription] = parent2NameFromAttribute.get(item).value || "-";
        }

        // Traitement des consommations selon le type
        const consumption: { [energyType: string]: number | undefined } = {};
        let totalConsumptionForIpe = 0;

        if (consumptionDataSourceType === "singleAttributeWithEnergyType") {
            // Mode : un attribut + type d'énergie
            if (singleTotalConsumptionAttribute && energyTypeAttribute) {
                const consumpValue = parseNumericValue(singleTotalConsumptionAttribute.get(item).value);
                const energy = energyTypeAttribute.get(item).value || "Unknown";
                consumption[energy] = consumpValue;
                totalConsumptionForIpe = consumpValue;
            }
        } else if (consumptionDataSourceType === "multipleAttributesPerEnergyType") {
            // Mode : attributs séparés par type d'énergie
            if (consoElecAttribute) {
                const val = parseNumericValue(consoElecAttribute.get(item).value);
                const relevant = isElecRelevantAttribute?.get(item).value ?? (val !== 0);
                consumption["Elec"] = addIfRelevant(val, relevant);
                if (consumption["Elec"] !== undefined) totalConsumptionForIpe += consumption["Elec"]!;
            }
            if (consoGazAttribute) {
                const val = parseNumericValue(consoGazAttribute.get(item).value);
                const relevant = isGazRelevantAttribute?.get(item).value ?? (val !== 0);
                consumption["Gaz"] = addIfRelevant(val, relevant);
                if (consumption["Gaz"] !== undefined) totalConsumptionForIpe += consumption["Gaz"]!;
            }
            if (consoAirAttribute) {
                const val = parseNumericValue(consoAirAttribute.get(item).value);
                const relevant = isAirRelevantAttribute?.get(item).value ?? (val !== 0);
                consumption["Air"] = addIfRelevant(val, relevant);
                if (consumption["Air"] !== undefined) totalConsumptionForIpe += consumption["Air"]!;
            }
        }
        
        // Calcul production et IPE
        let prodValue: number | undefined = undefined;
        let ipeValueRaw: number | undefined = undefined;

        if (productionAttribute) {
            prodValue = parseNumericValue(productionAttribute.get(item).value);
            if (prodValue !== undefined && prodValue > 0 && totalConsumptionForIpe !== 0) {
                ipeValueRaw = totalConsumptionForIpe / prodValue;
            } else if (prodValue === 0 && totalConsumptionForIpe !== 0) {
                ipeValueRaw = Infinity; 
            }
        }

        return {
            id: item.id,
            levelType: levelTypeIdentifier,
            displayName,
            parentNames: parents,
            consumption,
            production: prodValue,
            ipe: ipeValueRaw,
            totalConsumptionForIpe: totalConsumptionForIpe,
            originalItem: item,
            levelDepth: levelIndex
        };
    };

    return {
        isLoading,
        treeData,
        dataPreview
    };
}

/**
 * Construit l'arbre hiérarchique à partir des items traités
 */
function buildHierarchicalTree(allItemsArray: ProcessedDataItem[], reportLevels: any[]): ProcessedDataItem[] {
    const itemsById = new Map<string, ProcessedDataItem>();
    const itemsByDisplayNameAndDepth = new Map<string, ProcessedDataItem[]>();

    allItemsArray.forEach(item => {
        itemsById.set(item.id.toString(), item);
        item.children = [];

        const key = `${item.displayName}_${item.levelDepth}`;
        if (!itemsByDisplayNameAndDepth.has(key)) {
            itemsByDisplayNameAndDepth.set(key, []);
        }
        itemsByDisplayNameAndDepth.get(key)?.push(item);
    });

    const rootItems: ProcessedDataItem[] = [];
    allItemsArray.forEach(item => {
        let isRoot = true;
        const currentLevelConfig = reportLevels[item.levelDepth || 0];

        if (currentLevelConfig) {
            const parentConfigsToTry = [];
            if (currentLevelConfig.parent1LevelDescription && currentLevelConfig.parent1NameFromAttribute) {
                parentConfigsToTry.push({description: currentLevelConfig.parent1LevelDescription});
            }
            if (currentLevelConfig.parent2LevelDescription && currentLevelConfig.parent2NameFromAttribute) {
                parentConfigsToTry.push({description: currentLevelConfig.parent2LevelDescription});
            }

            for (const pConfig of parentConfigsToTry) {
                const parentDesc = pConfig.description;
                const parentNameValue = item.parentNames[parentDesc];

                if (parentNameValue && parentNameValue !== "-") {
                    for (let depth = (item.levelDepth || 0) - 1; depth >= 0; depth--) {
                        const searchKey = `${parentNameValue}_${depth}`;
                        const potentialParentsWithNameAndDepth = itemsByDisplayNameAndDepth.get(searchKey);

                        if (potentialParentsWithNameAndDepth) {
                            for (const potentialParent of potentialParentsWithNameAndDepth) {
                                const parentLevelConfig = reportLevels[depth];
                                if (parentLevelConfig && parentLevelConfig.levelTypeIdentifier === potentialParent.levelType) {
                                    const parentInMap = itemsById.get(potentialParent.id.toString());
                                    if (parentInMap) {
                                        parentInMap.children = parentInMap.children || [];
                                        parentInMap.children.push(item);
                                        isRoot = false;
                                        console.log(`PDFReportWidget: Attached ${item.displayName} (${item.levelType}) to parent ${parentInMap.displayName} (${parentInMap.levelType})`);
                                        break;
                                    }
                                }
                            }
                        }
                        if (!isRoot) break;
                    }
                }
                if (!isRoot) break;
            }
        }

        if (isRoot) {
            rootItems.push(item);
        }
    });

    return rootItems;
} 