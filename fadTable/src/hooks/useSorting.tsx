import { useState, useMemo } from "react";
import { EnergyData, SortOptions, Month } from "../types/energyData";

/**
 * Hook simplifié pour gérer le tri des données de consommation énergétique
 * @param data - Données énergétiques (déjà filtrées ou non)
 * @param months - Liste des mois pour le tri par mois
 * @returns Données triées et fonctions pour gérer le tri
 */
export const useSorting = (data: EnergyData[], months: Month[]) => {
    // État pour stocker les options de tri
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        field: "machineName",
        direction: "asc"
    });

    // Appliquer le tri aux données
    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Créer une copie pour ne pas modifier l'original
        const dataCopy = [...data];

        return dataCopy.sort((a, b) => {
            let valueA: any;
            let valueB: any;

            // Déterminer les valeurs à comparer en fonction du champ sélectionné
            switch (sortOptions.field) {
                case "machineName":
                    valueA = a.machineName?.toLowerCase() || "";
                    valueB = b.machineName?.toLowerCase() || "";
                    break;

                case "atelierName":
                    valueA = a.atelierName?.toLowerCase() || "";
                    valueB = b.atelierName?.toLowerCase() || "";
                    break;

                case "secteurName":
                    valueA = a.secteurName?.toLowerCase() || "";
                    valueB = b.secteurName?.toLowerCase() || "";
                    break;

                case "yearTotal":
                    valueA = a.yearTotal || 0;
                    valueB = b.yearTotal || 0;
                    break;

                default:
                    // Vérifier si c'est un tri par mois
                    if (sortOptions.field.startsWith("month_")) {
                        const monthId = sortOptions.field.split("_")[1];
                        valueA = a.monthlyValues[monthId] || 0;
                        valueB = b.monthlyValues[monthId] || 0;
                    } else {
                        // Par défaut, tri par nom de machine
                        valueA = a.machineName?.toLowerCase() || "";
                        valueB = b.machineName?.toLowerCase() || "";
                    }
                    break;
            }

            // Comparer les valeurs
            if (typeof valueA === "string" && typeof valueB === "string") {
                // Tri de chaînes
                return sortOptions.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            } else {
                // Tri de nombres
                return sortOptions.direction === "asc" ? valueA - valueB : valueB - valueA;
            }
        });
    }, [data, sortOptions]);

    // Mettre à jour le champ de tri
    const updateSortField = (field: string) => {
        setSortOptions(prev => {
            // Si on clique sur le même champ, inverser la direction
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }

            // Sinon, changer le champ et réinitialiser la direction
            return {
                field,
                direction: "asc"
            };
        });
    };

    // Réinitialiser le tri
    const resetSort = () => {
        setSortOptions({
            field: "machineName",
            direction: "asc"
        });
    };

    // Obtenir les options de tri disponibles de façon simplifiée
    const sortFields = useMemo(() => {
        const fields = [
            { id: "machineName", label: "Machine" },
            { id: "yearTotal", label: "Total Annuel" }
        ];

        // Ajouter les champs d'atelier et de secteur si présents dans les données
        const hasAtelier = data.some(item => item.atelierName !== undefined);
        const hasSecteur = data.some(item => item.secteurName !== undefined);

        if (hasAtelier) {
            fields.push({ id: "atelierName", label: "Atelier" });
        }

        if (hasSecteur) {
            fields.push({ id: "secteurName", label: "Secteur" });
        }

        // Ajouter seulement les options de tri par mois les plus pertinentes (jan, juin, déc)
        const keyMonths = [months[0], months[5], months[11]]; // Jan, Juin, Déc
        keyMonths.forEach(month => {
            if (month) {
                fields.push({ id: `month_${month.id}`, label: month.name });
            }
        });

        return fields;
    }, [data, months]);

    return {
        sortedData,
        sortOptions,
        sortFields,
        updateSortField,
        resetSort
    };
};
