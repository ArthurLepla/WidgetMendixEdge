import { Big } from "big.js";

export type BaseUnit = "auto" | "kWh" | "m3";

export interface ConversionResult {
    value: number;
    unit: string;
}

export interface FormattedValue {
    formattedValue: string;
    displayUnit: string;
}

/**
 * Convertit une valeur d'énergie dans l'unité la plus appropriée pour l'affichage
 * @param value La valeur à convertir
 * @param type Le type d'énergie (electricity, gas, water, air)
 * @param baseUnit L'unité de base personnalisée
 * @returns Un objet contenant la valeur convertie et l'unité appropriée
 */
export const getSmartUnit = (
    value: Big,
    type: "electricity" | "gas" | "water" | "air",
    baseUnit: BaseUnit = "auto"
): ConversionResult => {
    // En mode kWh forcé, appliquer la conversion électrique
    if (baseUnit === "kWh") {
        return convertElectricityUnit(value);
    } 
    // En mode m³ forcé, pas de conversion (garder en m³)
    else if (baseUnit === "m3") {
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
            return {
                value: value.toNumber(),
                unit: getDefaultUnit(type)
            };
    }
};

/**
 * Formate une valeur avec son unité convertie intelligemment
 * @param value La valeur à formater
 * @param type Le type d'énergie
 * @param baseUnit L'unité de base personnalisée
 * @param decimals Nombre de décimales (-1 pour auto)
 * @returns Une chaîne formatée avec la valeur et l'unité
 */
export const formatSmartValue = (
    value: Big,
    type: "electricity" | "gas" | "water" | "air",
    baseUnit: BaseUnit = "auto",
    decimals: number = -1
): FormattedValue => {
    const { value: convertedValue, unit } = getSmartUnit(value, type, baseUnit);
    
    // Ajuster le nombre de décimales selon l'unité pour plus de lisibilité
    let effectiveDecimals = decimals;
    if (decimals === -1) {
        if (unit.startsWith("T")) {
            effectiveDecimals = 3; // Plus de précision pour les grandes unités
        } else if (unit.startsWith("G")) {
            effectiveDecimals = 2;
        } else if (unit.startsWith("M")) {
            effectiveDecimals = 1;
        } else {
            effectiveDecimals = 1; // Décimale par défaut
        }
    }
    
    return {
        formattedValue: convertedValue.toFixed(effectiveDecimals),
        displayUnit: unit
    };
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
 * Retourne l'unité par défaut selon le type d'énergie
 */
const getDefaultUnit = (type: "electricity" | "gas" | "water" | "air"): string => {
    switch (type) {
        case "electricity":
            return "kWh";
        case "gas":
        case "water":
        case "air":
            return "m³";
        default:
            return "kWh";
    }
};

/**
 * Retourne la valeur en unité de base pour les comparaisons
 * @param value La valeur à normaliser
 * @returns La valeur en unité de base
 */
export const getBaseValueForComparison = (value: Big): number => {
    return value.toNumber();
};

/**
 * Compare deux valeurs en tenant compte de leur unité de base
 * @param a Première valeur
 * @param b Deuxième valeur
 * @returns -1 si a < b, 0 si a === b, 1 si a > b
 */
export const compareValues = (a: Big, b: Big): number => {
    const aBase = getBaseValueForComparison(a);
    const bBase = getBaseValueForComparison(b);
    
    if (aBase < bBase) return -1;
    if (aBase > bBase) return 1;
    return 0;
}; 