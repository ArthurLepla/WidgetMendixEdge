import { ValueStatus, ListValue, ListAttributeValue } from "mendix";
// Système de debug simple pour les hooks
const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`[CompareData] ${message}`, data || "");
    }
};

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
    // Recalcule à chaque changement de statut ou de contenu de la liste pour éviter les états figés
    if (featureList?.status !== ValueStatus.Available || !featureNameAttr) {
        return new Set<string>();
    }

    const activeNames = (featureList.items ?? [])
        .map(item => featureNameAttr.get(item)?.value)
        .filter((value): value is string => !!value);

    const map = new Set<string>(activeNames);
    debug("Features actifs", Array.from(map));
    return map;
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
    return useFeatureToggle(featureList, featureNameAttr, "Granularite_Manuelle");
}

/**
 * Hook spécialisé pour la feature Double_IPE
 */
export function useDoubleIPEToggle(
    featureList: ListValue | undefined,
    featureNameAttr: ListAttributeValue<string> | undefined
): boolean {
    return useFeatureToggle(featureList, featureNameAttr, "Double_IPE");
}