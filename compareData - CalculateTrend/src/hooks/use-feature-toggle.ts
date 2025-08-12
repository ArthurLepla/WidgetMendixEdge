import { useMemo } from "react";
import { ValueStatus, ListValue, ListAttributeValue } from "mendix";
import { debug } from "../utils/debugLogger";

/**
 * Hook pour obtenir un Set des features actives
 * @param featureList - Liste des features activées
 * @param featureNameAttr - Attribut contenant le nom de la feature
 * @returns Set<string> - Set des noms de features actives
 */
export function useFeatureMap(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined
): Set<string> {
    return useMemo(() => {
        if (featureList?.status !== ValueStatus.Available || !featureNameAttr) {
            debug("Features non disponibles", { 
                status: featureList?.status, 
                hasFeatureNameAttr: !!featureNameAttr 
            });
            return new Set<string>();
        }

        const activeNames = (featureList.items ?? [])
            .map(item => featureNameAttr.get(item)?.value)
            .filter((value): value is string => !!value);

        const map = new Set<string>(activeNames);
        debug("Features actifs détectés", {
            allFeatures: Array.from(map),
            count: map.size,
            rawItems: featureList.items?.length || 0
        });
        return map;
    }, [featureList?.status, featureList?.items, featureNameAttr]);
}

/**
 * Hook pour vérifier si une feature spécifique est activée
 * @param featureList - Liste des features activées
 * @param featureNameAttr - Attribut contenant le nom de la feature
 * @param featureName - Nom de la feature à vérifier
 * @returns boolean - true si la feature est activée
 */
export function useFeatureToggle(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined,
    featureName: string
): boolean {
    const featureMap = useFeatureMap(featureList, featureNameAttr);
    return featureMap.has(featureName);
}

/**
 * Hook spécialisé pour la feature Granularite_Manuelle
 */
export function useGranulariteManuelleToggle(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined
): boolean {
    const featureMap = useFeatureMap(featureList, featureNameAttr);
    
    // Détection flexible : chercher des features qui contiennent "granularite" ou "granularité"
    const hasGranulariteFeature = Array.from(featureMap).some(feature => 
        feature.toLowerCase().includes("granularite") || 
        feature.toLowerCase().includes("granularité")
    );
    
    console.log("Feature Granularite_Manuelle", { 
        isEnabled: hasGranulariteFeature, 
        featureName: "Granularite_Manuelle",
        availableFeatures: Array.from(featureMap),
        hasGranulariteFeature
    });
    
    return hasGranulariteFeature;
}

/**
 * Hook spécialisé pour la feature Double_IPE
 */
export function useDoubleIPEToggle(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined
): boolean {
    const featureMap = useFeatureMap(featureList, featureNameAttr);
    
    // Détection flexible : chercher des features qui contiennent "double" et "ipe"
    const hasDoubleIPEFeature = Array.from(featureMap).some(feature => 
        feature.toLowerCase().includes("double") && 
        feature.toLowerCase().includes("ipe")
    );
    
    console.log("Feature Double_IPE", { 
        isEnabled: hasDoubleIPEFeature, 
        featureName: "Double_IPE",
        availableFeatures: Array.from(featureMap),
        hasDoubleIPEFeature
    });
    
    return hasDoubleIPEFeature;
}

/**
 * Hook de debug pour afficher toutes les features disponibles
 * À utiliser temporairement pour diagnostiquer les noms de features
 */
export function useDebugFeatures(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined
): void {
    const featureMap = useFeatureMap(featureList, featureNameAttr);
    
    // Log détaillé pour diagnostiquer
    console.log("🔍 DEBUG Features - Toutes les features détectées", {
        totalFeatures: featureMap.size,
        allFeatureNames: Array.from(featureMap),
        featureListStatus: featureList?.status,
        hasFeatureNameAttr: !!featureNameAttr,
        rawItemsCount: featureList?.items?.length || 0
    });
    
    // Vérifier les features spécifiques avec différentes variantes
    const variants = [
        "Granularite_Manuelle",
        "Granularité_Manuelle", 
        "GranulariteManuelle",
        "GranularitéManuelle",
        "Double_IPE",
        "DoubleIPE", 
        "Double IPE",
        "DoubleIPE"
    ];
    
    const matches = variants.filter(variant => featureMap.has(variant));
    if (matches.length > 0) {
        console.log("✅ Features trouvées avec variantes", { matches });
    } else {
        console.log("❌ Aucune feature trouvée avec les variantes testées", { 
            testedVariants: variants,
            availableFeatures: Array.from(featureMap)
        });
    }
    
    // Log détaillé de chaque feature trouvée
    if (featureMap.size > 0) {
        console.log("🔍 Détail de chaque feature trouvée:", 
            Array.from(featureMap).map(feature => ({
                name: feature,
                length: feature.length,
                includesGranularite: feature.toLowerCase().includes("granularite"),
                includesDouble: feature.toLowerCase().includes("double"),
                includesIPE: feature.toLowerCase().includes("ipe")
            }))
        );
    }
}