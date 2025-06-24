import { useState, useMemo } from "react";
import { EnergyData } from "../types/energyData";

// Étendre l'interface FilterOptions pour inclure searchText
export interface ExtendedFilterOptions {
    machine?: string;
    atelier?: string;
    secteur?: string;
    minConsumption?: number;
    maxConsumption?: number;
    searchText?: string;
    [key: string]: any; // Pour permettre des filtres dynamiques supplémentaires
}

/**
 * Hook amélioré pour gérer le filtrage des données de consommation énergétique
 * @param data - Données énergétiques brutes
 * @returns Données filtrées et fonctions pour gérer les filtres
 */
export const useFilters = (data: EnergyData[]) => {
    // État pour stocker les options de filtrage
    const [filterOptions, setFilterOptions] = useState<ExtendedFilterOptions>({});

    // Appliquer les filtres aux données
    const filteredData = useMemo(() => {
        console.log("[useFilters] Recalculating filteredData with filterOptions:", filterOptions);
        const startTime = performance.now(); // Start timing
        const result = data.filter(item => {
            // Filtre par machine
            if (filterOptions.machine && item.machineName) {
                if (!item.machineName.toLowerCase().includes(filterOptions.machine.toLowerCase())) {
                    return false;
                }
            }

            // Filtre par atelier
            if (filterOptions.atelier && item.atelierName) {
                if (!item.atelierName.toLowerCase().includes(filterOptions.atelier.toLowerCase())) {
                    return false;
                }
            }

            // Filtre par secteur
            if (filterOptions.secteur && item.secteurName) {
                if (!item.secteurName.toLowerCase().includes(filterOptions.secteur.toLowerCase())) {
                    return false;
                }
            }

            // Filtre par consommation minimale
            if (filterOptions.minConsumption !== undefined && item.yearTotal < filterOptions.minConsumption) {
                return false;
            }

            // Filtre par consommation maximale
            if (filterOptions.maxConsumption !== undefined && item.yearTotal > filterOptions.maxConsumption) {
                return false;
            }

            // Recherche globale (searchText)
            if (filterOptions.searchText) {
                const searchTerm = filterOptions.searchText.toLowerCase();
                const matchesMachine = item.machineName && item.machineName.toLowerCase().includes(searchTerm);
                const matchesAtelier = item.atelierName && item.atelierName.toLowerCase().includes(searchTerm);
                const matchesSecteur = item.secteurName && item.secteurName.toLowerCase().includes(searchTerm);

                if (!matchesMachine && !matchesAtelier && !matchesSecteur) {
                    return false;
                }
            }

            // Tous les filtres sont passés
            return true;
        });
        const endTime = performance.now(); // End timing
        console.log(
            `[useFilters] Filtering took ${(endTime - startTime).toFixed(2)} ms. Found ${result.length} items.`
        );
        return result;
    }, [data, filterOptions]);

    // Mettre à jour un filtre
    const updateFilter = (key: string, value: any) => {
        setFilterOptions(prev => {
            if (value === null || value === undefined) {
                // Si la valeur est null ou undefined, supprimer le filtre
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
            } else {
                // Sinon, ajouter ou mettre à jour le filtre
                return {
                    ...prev,
                    [key]: value
                };
            }
        });
    };

    // Réinitialiser tous les filtres
    const resetFilters = () => {
        console.log("[useFilters] Resetting filterOptions");
        setFilterOptions({});
    };

    // Recherche textuelle globale
    const searchByText = (text: string) => {
        updateFilter("searchText", text ? text : null);
    };

    return {
        filteredData,
        filterOptions,
        updateFilter,
        resetFilters,
        searchByText,
        totalFiltered: filteredData.length,
        totalOriginal: data.length
    };
};
