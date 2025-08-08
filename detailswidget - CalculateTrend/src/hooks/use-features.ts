import { useMemo } from "react";
import { ValueStatus, ListValue, ListAttributeValue } from "mendix";
import { useGranulariteManuelleToggle, useDoubleIPEToggle } from "./use-feature-toggle";
import { debug } from "../utils/debugLogger";
import { METRIC_TYPES, getMetricTypeFromName } from "../utils/energy";

interface UseFeaturesProps {
    featureList: ListValue | undefined;
    featureNameAttr: ListAttributeValue<string> | undefined;
    consumptionDataSource: ListValue | undefined;
    consumptionDataSource2: ListValue | undefined;
    timestampAttr: ListAttributeValue<Date> | undefined;
    timestampAttr2: ListAttributeValue<Date> | undefined;
    consumptionAttr: ListAttributeValue<Big> | undefined;
    consumptionAttr2: ListAttributeValue<Big> | undefined;
    // Nouveaux attributs pour une détection IPE fiable
    NameAttr?: ListAttributeValue<string>;
    NameAttr2?: ListAttributeValue<string>;
    metricTypeAttr?: ListAttributeValue<string>;
    metricTypeAttr2?: ListAttributeValue<string>;
}

interface UseFeaturesReturn {
    isGranulariteManuelleEnabled: boolean;
    isDoubleIPEEnabled: boolean;
    hasIPE1Data: boolean;
    hasIPE2Data: boolean;
    isDoubleIPEActive: boolean;
    allowManualGranularity: boolean;
    // 🔄 Nouveaux champs pour la gestion des fallbacks
    fallbackMode: "none" | "single-ipe" | "no-data";
    fallbackReason: string;
    canDisplayData: boolean;
    // 🎯 Nouveaux champs pour la détection IPE
    ipeCount: number;
    recommendedMode: "double" | "single" | "fallback";
    shouldShowConsumptionFallback: boolean;
}

// 🎯 Fonction utilitaire pour détecter automatiquement les noms d'IPE
export function useAutoDetectedIPENames(
    consumptionDataSource: ListValue | undefined,
    consumptionDataSource2: ListValue | undefined,
    NameAttr: ListAttributeValue<string> | undefined,
    NameAttr2: ListAttributeValue<string> | undefined,
    hasIPE1Data: boolean,
    hasIPE2Data: boolean
) {
    return useMemo(() => {
        // Détection du nom IPE 1
        let ipe1Name = "IPE 1";
        if (hasIPE1Data && consumptionDataSource?.items && consumptionDataSource.items.length > 0 && NameAttr) {
            const firstItem = consumptionDataSource.items[0];
            const nameValue = NameAttr.get(firstItem).value;
            if (nameValue && typeof nameValue === "string" && nameValue.trim()) {
                ipe1Name = nameValue.trim();
            }
        }

        // Détection du nom IPE 2
        let ipe2Name = "IPE 2";
        if (hasIPE2Data && consumptionDataSource2?.items && consumptionDataSource2.items.length > 0 && NameAttr2) {
            const firstItem = consumptionDataSource2.items[0];
            const nameValue = NameAttr2.get(firstItem).value;
            if (nameValue && typeof nameValue === "string" && nameValue.trim()) {
                ipe2Name = nameValue.trim();
            }
        }

        debug("🎯 Noms IPE auto-détectés", { ipe1Name, ipe2Name, hasIPE1Data, hasIPE2Data });

        return { ipe1Name, ipe2Name };
    }, [consumptionDataSource, consumptionDataSource2, NameAttr, NameAttr2, hasIPE1Data, hasIPE2Data]);
}

// 🎯 Fonction utilitaire pour détecter automatiquement les unités des cartes à partir des variables de l'asset
export function useAutoDetectedCardUnits(
    energyType: string,
    viewMode: "energetic" | "ipe",
    // Variables de l'asset pour détecter les unités automatiquement
    assetVariablesDataSource?: ListValue,
    variableNameAttr?: ListAttributeValue<string>,
    variableUnitAttr?: ListAttributeValue<string>,
    variableMetricTypeAttr?: ListAttributeValue<string>,
    variableEnergyTypeAttr?: ListAttributeValue<string>,
    // Unités manuelles (priorité si définies)
    manualCard1Unit?: string,
    manualCard2Unit?: string,
    manualCard3Unit?: string,
    manualCard1Unit2?: string,
    manualCard2Unit2?: string,
    manualCard3Unit2?: string
) {
    return useMemo(() => {
        // Configuration des unités par défaut selon le type d'énergie et le mode
        const getDefaultUnit = (cardIndex: number) => {
            if (viewMode === "ipe") {
                // Mode IPE : unités spécifiques aux cartes IPE
                switch (cardIndex) {
                    case 1: return "kWh"; // Consommation
                    case 2: return "kWh"; // Production
                    case 3: return "%";   // IPE
                    default: return "kWh";
                }
            } else {
                // Mode énergétique : unités selon le type d'énergie
                switch (energyType) {
                    case "electricity": return "kWh";
                    case "gas": return "m³";
                    case "water": return "m³";
                    case "air": return "m³";
                    default: return "kWh";
                }
            }
        };

        // Fonction pour détecter l'unité d'une variable par son type de métrique
        const detectUnitFromVariables = (metricType: string, energyType?: string) => {
            if (!assetVariablesDataSource?.items || assetVariablesDataSource.items.length === 0) {
                return null;
            }

            for (const item of assetVariablesDataSource.items) {
                const varUnit = variableUnitAttr?.get(item).value;
                const varMetricType = variableMetricTypeAttr?.get(item).value;
                const varEnergyType = variableEnergyTypeAttr?.get(item).value;

                // Vérifier si la variable correspond au type de métrique recherché
                if (varMetricType === metricType) {
                    // Si on a un type d'énergie spécifique, vérifier qu'il correspond
                    if (energyType && varEnergyType && varEnergyType !== energyType) {
                        continue;
                    }
                    
                    if (varUnit && varUnit.trim()) {
                        return varUnit.trim();
                    }
                }
            }
            return null;
        };

        // Détection des unités pour IPE 1
        let card1Unit = manualCard1Unit;
        let card2Unit = manualCard2Unit;
        let card3Unit = manualCard3Unit;

        // Si les unités manuelles ne sont pas définies, essayer de les détecter automatiquement
        if (!card1Unit) {
            if (viewMode === "ipe") {
                card1Unit = detectUnitFromVariables("Conso") || getDefaultUnit(1);
            } else {
                card1Unit = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(1);
            }
        }

        if (!card2Unit) {
            if (viewMode === "ipe") {
                card2Unit = detectUnitFromVariables("Prod") || getDefaultUnit(2);
            } else {
                card2Unit = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(2);
            }
        }

        if (!card3Unit) {
            if (viewMode === "ipe") {
                card3Unit = detectUnitFromVariables("IPE") || getDefaultUnit(3);
            } else {
                card3Unit = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(3);
            }
        }

        // Détection des unités pour IPE 2 (même logique que IPE 1)
        let card1Unit2 = manualCard1Unit2;
        let card2Unit2 = manualCard2Unit2;
        let card3Unit2 = manualCard3Unit2;

        if (!card1Unit2) {
            if (viewMode === "ipe") {
                card1Unit2 = detectUnitFromVariables("Conso") || getDefaultUnit(1);
            } else {
                card1Unit2 = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(1);
            }
        }

        if (!card2Unit2) {
            if (viewMode === "ipe") {
                card2Unit2 = detectUnitFromVariables("Prod") || getDefaultUnit(2);
            } else {
                card2Unit2 = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(2);
            }
        }

        if (!card3Unit2) {
            if (viewMode === "ipe") {
                card3Unit2 = detectUnitFromVariables("IPE") || getDefaultUnit(3);
            } else {
                card3Unit2 = detectUnitFromVariables("Conso", energyType) || getDefaultUnit(3);
            }
        }

        debug("🎯 Unités cartes auto-détectées", {
            energyType,
            viewMode,
            card1Unit,
            card2Unit,
            card3Unit,
            card1Unit2,
            card2Unit2,
            card3Unit2,
            manualUnits: {
                card1Unit: manualCard1Unit,
                card2Unit: manualCard2Unit,
                card3Unit: manualCard3Unit,
                card1Unit2: manualCard1Unit2,
                card2Unit2: manualCard2Unit2,
                card3Unit2: manualCard3Unit2
            }
        });

        return {
            card1Unit,
            card2Unit,
            card3Unit,
            card1Unit2,
            card2Unit2,
            card3Unit2
        };
    }, [
        energyType, 
        viewMode, 
        assetVariablesDataSource, 
        variableNameAttr, 
        variableUnitAttr, 
        variableMetricTypeAttr, 
        variableEnergyTypeAttr,
        manualCard1Unit,
        manualCard2Unit,
        manualCard3Unit,
        manualCard1Unit2,
        manualCard2Unit2,
        manualCard3Unit2
    ]);
}

export function useFeatures({
    featureList,
    featureNameAttr,
    consumptionDataSource,
    consumptionDataSource2,
    timestampAttr,
    timestampAttr2,
    consumptionAttr,
    consumptionAttr2,
    NameAttr,
    NameAttr2,
    metricTypeAttr,
    metricTypeAttr2
}: UseFeaturesProps): UseFeaturesReturn {
    
    // Feature toggles
    const isGranulariteManuelleEnabled = useGranulariteManuelleToggle(featureList, featureNameAttr);
    const isDoubleIPEEnabled = useDoubleIPEToggle(featureList, featureNameAttr);
    
    // Vérification stricte: considérer IPE présent uniquement si au moins 1 item a MetricType IPE/IPE_kg
    const hasIPE1Data = useMemo(() => {
        if (
            consumptionDataSource?.status !== ValueStatus.Available ||
            !timestampAttr || !consumptionAttr ||
            !(consumptionDataSource.items?.length && consumptionDataSource.items.length > 0)
        ) {
            return false;
        }
        const items = consumptionDataSource.items;
        const maxScan = Math.min(items.length, 100);
        let ipeCount = 0;
        let firstMatchIndex: number | null = null;
        let firstMatchName: string | undefined;
        let firstMatchMetricType: string | undefined;
        for (let i = 0; i < maxScan; i++) {
            const it = items[i];
            const mt = metricTypeAttr?.get(it)?.value?.trim();
            const nameVal = NameAttr?.get(it)?.value;
            const mtFallback = getMetricTypeFromName(nameVal);
            const finalMt = (mt || mtFallback)?.toString();
            if (finalMt === METRIC_TYPES.IPE || finalMt === METRIC_TYPES.IPE_KG) {
                ipeCount++;
                if (firstMatchIndex === null) {
                    firstMatchIndex = i;
                    firstMatchName = nameVal || undefined;
                    firstMatchMetricType = finalMt;
                }
            }
        }
        debug("🔎 IPE scan DS1", {
            scanned: maxScan,
            total: items.length,
            ipeCount,
            firstMatch: firstMatchIndex !== null ? {
                index: firstMatchIndex,
                name: firstMatchName,
                metricType: firstMatchMetricType
            } : null
        });
        return ipeCount > 0;
    }, [consumptionDataSource, timestampAttr, consumptionAttr, metricTypeAttr, NameAttr]);

    const hasIPE2Data = useMemo(() => {
        if (
            consumptionDataSource2?.status !== ValueStatus.Available ||
            !timestampAttr2 || !consumptionAttr2 ||
            !(consumptionDataSource2.items?.length && consumptionDataSource2.items.length > 0)
        ) {
            return false;
        }
        const items = consumptionDataSource2.items;
        const maxScan = Math.min(items.length, 100);
        let ipeCount = 0;
        let firstMatchIndex: number | null = null;
        let firstMatchName: string | undefined;
        let firstMatchMetricType: string | undefined;
        for (let i = 0; i < maxScan; i++) {
            const it = items[i];
            const mt = metricTypeAttr2?.get(it)?.value?.trim();
            const nameVal = NameAttr2?.get(it)?.value;
            const mtFallback = getMetricTypeFromName(nameVal);
            const finalMt = (mt || mtFallback)?.toString();
            if (finalMt === METRIC_TYPES.IPE || finalMt === METRIC_TYPES.IPE_KG) {
                ipeCount++;
                if (firstMatchIndex === null) {
                    firstMatchIndex = i;
                    firstMatchName = nameVal || undefined;
                    firstMatchMetricType = finalMt;
                }
            }
        }
        debug("🔎 IPE scan DS2", {
            scanned: maxScan,
            total: items.length,
            ipeCount,
            firstMatch: firstMatchIndex !== null ? {
                index: firstMatchIndex,
                name: firstMatchName,
                metricType: firstMatchMetricType
            } : null
        });
        return ipeCount > 0;
    }, [consumptionDataSource2, timestampAttr2, consumptionAttr2, metricTypeAttr2, NameAttr2]);
    
    // 🎯 Détection du nombre d'IPE disponibles
    const ipeCount = useMemo(() => {
        let count = 0;
        if (hasIPE1Data) count++;
        if (hasIPE2Data) count++;
        return count;
    }, [hasIPE1Data, hasIPE2Data]);
    
    // 🎯 Mode recommandé basé sur les données disponibles
    const recommendedMode = useMemo(() => {
        if (ipeCount >= 2) return "double" as const;
        if (ipeCount === 1) return "single" as const;
        return "fallback" as const;
    }, [ipeCount]);
    
    // 🎯 Fallback vers consommation si pas d'IPE
    const shouldShowConsumptionFallback = useMemo(() => {
        return ipeCount === 0;
    }, [ipeCount]);
    
    // 🔄 Logique de fallback améliorée
    const fallbackInfo = useMemo(() => {
        // Cas 1 : Aucune donnée IPE disponible
        if (!hasIPE1Data && !hasIPE2Data) {
            return {
                fallbackMode: "no-data" as const,
                fallbackReason: "Aucune donnée IPE disponible pour cet asset",
                canDisplayData: false
            };
        }
        
        // Cas 2 : Seulement IPE 1 disponible
        if (hasIPE1Data && !hasIPE2Data) {
            return {
                fallbackMode: "single-ipe" as const,
                fallbackReason: "Seul l'IPE 1 est disponible pour cet asset",
                canDisplayData: true
            };
        }
        
        // Cas 3 : Seulement IPE 2 disponible (cas rare mais possible)
        if (!hasIPE1Data && hasIPE2Data) {
            return {
                fallbackMode: "single-ipe" as const,
                fallbackReason: "Seul l'IPE 2 est disponible pour cet asset",
                canDisplayData: true
            };
        }
        
        // Cas 4 : Les deux IPE sont disponibles
        if (hasIPE1Data && hasIPE2Data) {
            return {
                fallbackMode: "none" as const,
                fallbackReason: "Toutes les données IPE sont disponibles",
                canDisplayData: true
            };
        }
        
        // Cas par défaut (ne devrait jamais arriver)
        return {
            fallbackMode: "no-data" as const,
            fallbackReason: "État inconnu des données IPE",
            canDisplayData: false
        };
    }, [hasIPE1Data, hasIPE2Data]);
    
    // Double IPE actif uniquement si la feature est autorisée ET si les données IPE 2 sont disponibles
    const isDoubleIPEActive = useMemo(() => {
        const shouldBeActive = isDoubleIPEEnabled && hasIPE2Data;
        
        // Log de debug pour comprendre les décisions
        debug("🔍 Double IPE Decision", {
            isDoubleIPEEnabled,
            hasIPE2Data,
            shouldBeActive,
            fallbackMode: fallbackInfo.fallbackMode,
            fallbackReason: fallbackInfo.fallbackReason,
            ipeCount,
            recommendedMode,
            shouldShowConsumptionFallback
        });
        
        return shouldBeActive;
    }, [isDoubleIPEEnabled, hasIPE2Data, fallbackInfo, ipeCount, recommendedMode, shouldShowConsumptionFallback]);
    
    // Permissions pour la granularité manuelle
    const allowManualGranularity = isGranulariteManuelleEnabled;
    
    const result = {
        isGranulariteManuelleEnabled,
        isDoubleIPEEnabled,
        hasIPE1Data,
        hasIPE2Data,
        isDoubleIPEActive,
        allowManualGranularity,
        // 🔄 Nouveaux champs
        ...fallbackInfo,
        // 🎯 Nouveaux champs pour la détection IPE
        ipeCount,
        recommendedMode,
        shouldShowConsumptionFallback
    };
    
    debug("useFeatures → état calculé", result);
    return result;
}
