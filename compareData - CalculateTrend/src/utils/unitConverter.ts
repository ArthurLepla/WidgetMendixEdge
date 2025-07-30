import { Big } from "big.js";
import { EnergyType } from "./types";
import { ENERGY_CONFIG } from "./energyConfig";
import { BaseUnitEnum } from "../../typings/CompareDataProps";

// Alias pour le type de base
export type BaseUnit = BaseUnitEnum;

interface ConversionResult {
    value: number;
    unit: string;
}

/**
 * Convertit une valeur d'énergie dans l'unité la plus appropriée pour l'affichage
 * @param value La valeur à convertir
 * @param type Le type d'énergie (électricité, gaz, eau, air)
 * @param viewMode Le mode d'affichage (energetic ou ipe)
 * @param baseUnit L'unité de base personnalisée (optionnel, "auto" par défaut)
 * @returns Un objet contenant la valeur convertie et l'unité appropriée
 */
export const getSmartUnit = (
    value: Big,
    type: EnergyType,
    viewMode: "energetic" | "ipe",
    baseUnit: BaseUnit = "auto"
): ConversionResult => {
    // Pour le mode IPE, on ne fait PAS de conversion d'unités
    // On garde les valeurs en unité de base spécifiée ou par défaut
    if (viewMode === "ipe") {
        const numericValue = value.toNumber();
        const config = ENERGY_CONFIG[type as EnergyType];
        
        // Si une unité de base est spécifiée et différente de "auto"
        if (baseUnit !== "auto") {
            const baseUnitForIPE = getBaseUnitForIPE(baseUnit);
            return {
                value: numericValue,
                unit: baseUnitForIPE
            };
        }
        
        return {
            value: numericValue,
            unit: config.ipeUnit
        };
    }

    // En mode énergétique, appliquer la conversion intelligente selon l'unité de base
    if (baseUnit === "kWh") {
        // Les données sont en kWh, appliquer la conversion électrique
        return convertElectricityUnit(value);
    } else if (baseUnit === "m3") {
        // Les données sont en m³, pas de conversion (garder en m³)
        return {
            value: value.toNumber(),
            unit: "m³"
        };
    }

    // Mode auto : conversion automatique selon le type d'énergie
    switch (type) {
        case "electricity":
            return convertElectricityUnit(value);
        case "gas":
        case "water":
        case "air":
            return convertVolumeUnit(value);
        default:
            // Par défaut, renvoyer la valeur sans conversion
            const defaultConfig = ENERGY_CONFIG[type as EnergyType];
            return {
                value: value.toNumber(),
                unit: defaultConfig.unit
            };
    }
};

/**
 * Retourne la valeur en unité de base pour les comparaisons
 * Cela évite les problèmes de comparaison entre différentes unités converties
 * @param value La valeur à normaliser
 * @returns La valeur en unité de base (toujours la même unité pour le même type d'énergie)
 */
export const getBaseValueForComparison = (value: Big): number => {
    // Pour les comparaisons, on retourne toujours la valeur brute
    // C'est l'unité de base et ça garantit des comparaisons cohérentes
    return value.toNumber();
};

/**
 * Compare deux valeurs en tenant compte de leur unité de base
 * Retourne -1 si a < b, 0 si a === b, 1 si a > b
 * @param a Première valeur
 * @param b Deuxième valeur
 */
export const compareValues = (a: Big, b: Big): number => {
    const aBase = getBaseValueForComparison(a);
    const bBase = getBaseValueForComparison(b);
    
    if (aBase < bBase) return -1;
    if (aBase > bBase) return 1;
    return 0;
};

/**
 * Convertit une valeur d'électricité en kWh, MWh, GWh ou TWh
 */
const convertElectricityUnit = (value: Big): ConversionResult => {
    const numericValue = value.toNumber();

    if (numericValue >= 1000000000) {
        // Convertir en TWh (térawatt-heure) pour des valeurs très grandes
        return {
            value: numericValue / 1000000000,
            unit: "TWh"
        };
    } else if (numericValue >= 1000000) {
        // Convertir en GWh
        return {
            value: numericValue / 1000000,
            unit: "GWh"
        };
    } else if (numericValue >= 1000) {
        // Convertir en MWh
        return {
            value: numericValue / 1000,
            unit: "MWh"
        };
    } else {
        // Garder en kWh
        return {
            value: numericValue,
            unit: "kWh"
        };
    }
};

/**
 * Convertit une valeur volumique (m³) en unités appropriées
 */
const convertVolumeUnit = (value: Big): ConversionResult => {
    const numericValue = value.toNumber();

    if (numericValue >= 1000000000) {
        // Convertir en milliards de m³
        return {
            value: numericValue / 1000000000,
            unit: "Gm³"
        };
    } else if (numericValue >= 1000000) {
        // Convertir en millions de m³
        return {
            value: numericValue / 1000000,
            unit: "Mm³"
        };
    } else if (numericValue >= 1000) {
        // Convertir en milliers de m³
        return {
            value: numericValue / 1000,
            unit: "km³"
        };
    } else {
        // Garder en m³
        return {
            value: numericValue,
            unit: "m³"
        };
    }
};

/**
 * Retourne l'unité de base formatée pour l'affichage IPE
 */
const getBaseUnitForIPE = (baseUnit: BaseUnit): string => {
    switch (baseUnit) {
        case "kWh":
            return "kWh/pièce";
        case "m3":
            return "m³/pièce";
        default:
            return "kWh/pièce"; // par défaut
    }
};

/**
 * Formatter une valeur avec son unité convertie intelligemment
 */
export const formatSmartValue = (
    value: Big,
    type: EnergyType,
    viewMode: "energetic" | "ipe",
    baseUnit: BaseUnit = "auto",
    decimals: number = -1
): string => {
    const { value: convertedValue, unit } = getSmartUnit(value, type, viewMode, baseUnit);
    
    // Ajuster le nombre de décimales selon l'unité pour plus de lisibilité
    let effectiveDecimals = decimals;
    if (decimals === -1) {
        if (viewMode === "ipe") {
            // En mode IPE, on peut avoir des valeurs décimales (float)
            effectiveDecimals = 2;
        } else {
            // Si les décimales ne sont pas spécifiées, utiliser des valeurs par défaut selon l'unité
            if (unit.startsWith("T")) {
                effectiveDecimals = 3; // Plus de précision pour les grandes unités
            } else if (unit.startsWith("G")) {
                effectiveDecimals = 2;
            } else if (unit.startsWith("M")) {
                effectiveDecimals = 1;
            } else {
                effectiveDecimals = 0; // Pas de décimales pour les petites unités
            }
        }
    }
    
    return `${convertedValue.toFixed(effectiveDecimals)} ${unit}`;
}; 