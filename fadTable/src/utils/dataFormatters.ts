import { SelectedEnergyTypeEnum } from "../../typings/FadTableProps";

/**
 * Retourne l'unité principale basée sur le type d'énergie.
 * @param energyType - Le type d'énergie ("Elec", "Gaz", "Eau", "Air")
 * @returns L'unité ("kWh" ou "m³")
 */
export const getUnit = (energyType: SelectedEnergyTypeEnum): string => {
    switch (energyType) {
        case "Elec":
            return "kWh";
        case "Gaz":
        case "Eau":
        case "Air":
            return "m³";
        default:
            return ""; // Should not happen with enum type
    }
};

/**
 * Formatte une valeur de consommation énergétique avec mise à l'échelle pour Elec
 * et unité fixe pour les autres, en utilisant le format français.
 * @param value - Valeur numérique à formater
 * @param energyType - Le type d'énergie ("Elec", "Gaz", "Eau", "Air")
 * @returns Chaîne formatée avec unité
 */
export const formatEnergy = (value: number, energyType: SelectedEnergyTypeEnum): string => {
    if (isNaN(value)) return "-";

    if (energyType === "Elec") {
        let scaledValue = value;
        let unit = "kWh";

        if (value >= 1_000_000) {
            scaledValue = value / 1_000_000;
            unit = "GWh";
        } else if (value >= 1_000) {
            scaledValue = value / 1_000;
            unit = "MWh";
        }

        return (
            new Intl.NumberFormat("fr-FR", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            }).format(scaledValue) +
            " " +
            unit
        );
    } else {
        // Pour Gaz, Eau, Air -> m³
        const unit = getUnit(energyType); // Obtenir "m³"
        return (
            new Intl.NumberFormat("fr-FR", {
                maximumFractionDigits: 2, // Garder un peu de précision si nécessaire
                minimumFractionDigits: 0
            }).format(value) +
            " " +
            unit
        );
    }
};

/**
 * Formatte un pourcentage avec le format français
 * @param value - Valeur en pourcentage à formater
 * @param decimals - Nombre de décimales à afficher
 * @returns Chaîne formatée
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    if (isNaN(value)) return "-";

    return (
        new Intl.NumberFormat("fr-FR", {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        }).format(value) + " %"
    );
};

/**
 * Calcule la variation en pourcentage entre deux valeurs
 * @param current - Valeur actuelle
 * @param previous - Valeur précédente
 * @returns Pourcentage de variation
 */
export const calculateVariation = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Détermine la classe CSS à appliquer en fonction de la variation
 * @param variation - Pourcentage de variation
 * @returns Classe CSS à appliquer
 */
export const getVariationClass = (variation: number): string => {
    if (variation > 0) return "variation-increase";
    if (variation < 0) return "variation-decrease";
    return "variation-neutral";
};

/**
 * Formatte un nombre avec une unité spécifique
 * @param value - Valeur à formater
 * @param unit - Unité à afficher
 * @param decimals - Nombre de décimales
 * @returns Chaîne formatée
 */
export const formatNumber = (value: number, unit: string = "", decimals: number = 0): string => {
    if (isNaN(value)) return "-";

    return (
        new Intl.NumberFormat("fr-FR", {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        }).format(value) + (unit ? " " + unit : "")
    );
};
