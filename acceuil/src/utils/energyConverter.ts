import { Big } from "big.js";

export type BaseUnit = "kWh" | "m3";

export interface FormattedValue {
    value: string;
    unit: string;
}

/**
 * Convertit une valeur énergétique avec unité de base flexible
 * @param value - Valeur numérique à convertir
 * @param baseUnit - Unité de base des données d'entrée ("kWh" ou "m3")
 * @returns Valeur formatée avec unité optimale
 */
export const formatFlexibleEnergyValue = (value: Big, baseUnit: BaseUnit): FormattedValue => {
    if (baseUnit === "kWh") {
        return formatPowerValue(value);
    } else if (baseUnit === "m3") {
        return formatVolumeValue(value);
    }
    
    // Fallback: retourner la valeur telle quelle
    return {
        value: value.toFixed(1),
        unit: baseUnit
    };
};

/**
 * Formate une valeur en kWh avec conversion intelligente vers MWh, GWh, TWh
 */
const formatPowerValue = (value: Big): FormattedValue => {
    if (value.gte(1000000000)) { // 1 000 000 000 kWh = 1 TWh
        return {
            value: value.div(1000000000).toFixed(1),
            unit: "TWh"
        };
    } else if (value.gte(1000000)) { // 1 000 000 kWh = 1 GWh
        return {
            value: value.div(1000000).toFixed(1),
            unit: "GWh"
        };
    } else if (value.gte(1000)) { // 1 000 kWh = 1 MWh
        return {
            value: value.div(1000).toFixed(1),
            unit: "MWh"
        };
    } else {
        return {
            value: value.toFixed(1),
            unit: "kWh"
        };
    }
};

/**
 * Formate une valeur en m³ (pas de conversion automatique pour les volumes)
 */
const formatVolumeValue = (value: Big): FormattedValue => {
    return {
        value: value.toFixed(1),
        unit: "m³"
    };
};

/**
 * Récupère l'unité de base par défaut selon le type d'énergie (rétrocompatibilité)
 */
export const getDefaultUnit = (energyType: "electricity" | "gas" | "water" | "air"): BaseUnit => {
    switch (energyType) {
        case "electricity":
            return "kWh";
        case "gas":
        case "water":
        case "air":
            return "m3";
        default:
            return "kWh";
    }
}; 