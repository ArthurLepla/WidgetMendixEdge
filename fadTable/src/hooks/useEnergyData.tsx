import { useState, useEffect } from "react";
import { EnergyData, Month } from "../types/energyData";
import { FadTableContainerProps } from "../../typings/FadTableProps";
import { ValueStatus, ObjectItem, ListAttributeValue } from "mendix"; // Import necessary types

/**
 * Helper function to safely get a STRING value from a Mendix attribute.
 */
function getMendixStringValue(attribute: ListAttributeValue | undefined, item: ObjectItem): string | undefined {
    if (attribute && attribute.get) {
        try {
            const attrValue = attribute.get(item);
            // Check if the value is available and not null/undefined
            if (
                attrValue.status === ValueStatus.Available &&
                attrValue.value !== null &&
                attrValue.value !== undefined
            ) {
                const value = attrValue.value;
                // Additional safety check to ensure we return a proper string
                if (typeof value === 'object') {
                    console.warn(`[getMendixStringValue] Attribute value is an object, converting:`, value);
                    return JSON.stringify(value);
                }
                return String(value); // Ensure it's a string
            }
        } catch (e) {
            console.error("Error getting string attribute value:", e);
        }
    }
    return undefined;
}

/**
 * Helper function to safely get a NUMERIC value from a Mendix attribute.
 */
function getMendixNumericValue(attribute: ListAttributeValue | undefined, item: ObjectItem): number | undefined {
    if (attribute && attribute.get) {
        try {
            const attrValue = attribute.get(item);
            // Check if the value is available and not null/undefined
            if (
                attrValue.status === ValueStatus.Available &&
                attrValue.value !== null &&
                attrValue.value !== undefined
            ) {
                // Use parseFloat for robustness with Decimals
                const num = parseFloat(String(attrValue.value));
                return isNaN(num) ? undefined : num;
            }
        } catch (e) {
            console.error("Error getting numeric attribute value:", e);
        }
    }
    return undefined;
}

/**
 * Hook amélioré pour gérer les données de consommation énergétique
 * @param props - Props du container FadTable
 * @returns Données et fonctions pour gérer les données
 */
export const useEnergyData = (props: FadTableContainerProps) => {
    const { selectedEnergyType } = props;
    // États pour stocker les données
    const [data, setData] = useState<EnergyData[]>([]); // Renamed from rawData for clarity
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Définir la liste des mois (récupère les attributs depuis les props)
    const months: Month[] = [
        { id: "Jan", name: "Janvier", attr: props.attrJanValue, prevAttr: props.attrPrevJanValue },
        { id: "Feb", name: "Février", attr: props.attrFebValue, prevAttr: props.attrPrevFebValue },
        { id: "Mar", name: "Mars", attr: props.attrMarValue, prevAttr: props.attrPrevMarValue },
        { id: "Apr", name: "Avril", attr: props.attrAprValue, prevAttr: props.attrPrevAprValue },
        { id: "May", name: "Mai", attr: props.attrMayValue, prevAttr: props.attrPrevMayValue },
        { id: "Jun", name: "Juin", attr: props.attrJunValue, prevAttr: props.attrPrevJunValue },
        { id: "Jul", name: "Juillet", attr: props.attrJulValue, prevAttr: props.attrPrevJulValue },
        { id: "Aug", name: "Août", attr: props.attrAugValue, prevAttr: props.attrPrevAugValue },
        { id: "Sep", name: "Septembre", attr: props.attrSepValue, prevAttr: props.attrPrevSepValue },
        { id: "Oct", name: "Octobre", attr: props.attrOctValue, prevAttr: props.attrPrevOctValue },
        { id: "Nov", name: "Novembre", attr: props.attrNovValue, prevAttr: props.attrPrevNovValue },
        { id: "Dec", name: "Décembre", attr: props.attrDecValue, prevAttr: props.attrPrevDecValue }
    ];

    // Charger les données depuis Mendix
    useEffect(() => {
        // Check if dsGridData is available and has items
        if (props.dsGridData && props.dsGridData.status === ValueStatus.Available && props.dsGridData.items) {
            setIsLoading(true);
            setError(null);

            // -----> FILTRAGE INITIAL PAR TYPE D'ENERGIE <-----
            const filteredItems = props.dsGridData.items.filter(item => {
                // Utiliser la fonction helper avec l'attribut TypeEnergie des props
                const typeEnergieValue = getMendixStringValue(props.attrTypeEnergie, item);
                return typeEnergieValue === selectedEnergyType;
            });
            // -------------------------------------------------

            // -----> TRAITEMENT DES DONNEES FILTREES <-----
            const loadedData: EnergyData[] = filteredItems.map(item => {
                // 1. Extract Identification Data
                const machineName = getMendixStringValue(props.attrMachineName, item) ?? "N/A";
                const atelierName = getMendixStringValue(props.attrAtelierName, item);
                const secteurName = getMendixStringValue(props.attrSecteurName, item);
                
                // Debug pour identifier les objets
                if (typeof machineName === 'object') {
                    console.error(`[DEBUG] machineName is an object:`, machineName, item);
                }
                if (typeof atelierName === 'object') {
                    console.error(`[DEBUG] atelierName is an object:`, atelierName, item);
                }
                if (typeof secteurName === 'object') {
                    console.error(`[DEBUG] secteurName is an object:`, secteurName, item);
                }

                // 1b. Extract Flexible Hierarchy Data (if available)
                const niveau1Name = getMendixStringValue(props.hierarchyLevel1Attr, item);
                const niveau2Name = getMendixStringValue(props.hierarchyLevel2Attr, item);
                const niveau3Name = getMendixStringValue(props.hierarchyLevel3Attr, item);
                const niveau4Name = getMendixStringValue(props.hierarchyLevel4Attr, item);
                const niveau5Name = getMendixStringValue(props.hierarchyLevel5Attr, item);
                const niveau6Name = getMendixStringValue(props.hierarchyLevel6Attr, item);
                const niveau7Name = getMendixStringValue(props.hierarchyLevel7Attr, item);
                const niveau8Name = getMendixStringValue(props.hierarchyLevel8Attr, item);
                const niveau9Name = getMendixStringValue(props.hierarchyLevel9Attr, item);
                const niveau10Name = getMendixStringValue(props.hierarchyLevel10Attr, item);

                // 2. Extract Monthly Values for Year N
                const monthlyValues: { [key: string]: number } = {};
                let calculatedYearTotalN = 0;
                months.forEach(month => {
                    const value = getMendixNumericValue(month.attr, item);
                    monthlyValues[month.id] = value ?? 0;
                    calculatedYearTotalN += value ?? 0;
                });

                // 3. Extract Total Year Value for Year N (use calculated if attribute fails)
                const yearTotalFromAttr = getMendixNumericValue(props.attrTotalYearValue, item);
                const yearTotal = yearTotalFromAttr ?? calculatedYearTotalN;

                // 4. Extract Previous Year Data (if enabled)
                let previousYearValues: { [key: string]: number } | undefined = undefined;
                let previousYearTotal: number | undefined = undefined;

                if (props.enableComparison) {
                    previousYearValues = {};
                    let calculatedPrevYearTotal = 0;
                    months.forEach(month => {
                        const prevValue = getMendixNumericValue(month.prevAttr, item);
                        previousYearValues![month.id] = prevValue ?? 0;
                        calculatedPrevYearTotal += prevValue ?? 0;
                    });
                    const prevTotalFromAttr = getMendixNumericValue(props.attrPrevTotalYearValue, item);
                    previousYearTotal = prevTotalFromAttr ?? calculatedPrevYearTotal;
                }

                // 5. Construct the final EnergyData object
                const energyData: EnergyData = {
                    id: item.id, // Use the actual Mendix object ID
                    machineName,
                    atelierName, // Will be undefined if not extracted
                    secteurName, // Will be undefined if not extracted
                    monthlyValues,
                    yearTotal,
                    // Include previous year data if available
                    ...(props.enableComparison && {
                        previousYearValues,
                        previousYearTotal
                    }),
                    // Include flexible hierarchy data if available
                    niveau1Name,
                    niveau2Name,
                    niveau3Name,
                    niveau4Name,
                    niveau5Name,
                    niveau6Name,
                    niveau7Name,
                    niveau8Name,
                    niveau9Name,
                    niveau10Name,
                    // Store reference to original Mendix object for attribute access if needed
                    originalMendixObject: item
                };

                return energyData;
            });
            // ---------------------------------------------

            console.log(`Données transformées pour ${selectedEnergyType}:`, loadedData); // Log specific type
            setData(loadedData);
            setIsLoading(false);
        } else if (props.dsGridData && props.dsGridData.status === ValueStatus.Loading) {
            // Data is loading
            setIsLoading(true);
            setError(null);
        } else {
            // Data is unavailable or error occurred
            setData([]); // Clear data
            setError("Aucune donnée disponible ou erreur lors du chargement.");
            setIsLoading(false);
        }
        // Dependency array: React to changes in the data source AND the selected energy type
    }, [props.dsGridData, selectedEnergyType]);

    return {
        data, // Use the processed data state
        isLoading,
        error,
        months
    };
};
