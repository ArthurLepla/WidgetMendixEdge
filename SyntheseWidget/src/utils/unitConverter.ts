import { Big } from "big.js";
import { EnergyType } from "../typings/EnergyTypes";

// Types d'unités de base supportées
export type BaseUnit = "kWh" | "m3";

// Interface pour le résultat formaté
export interface FormattedValue {
    formattedValue: string;
    displayUnit: string;
}

// Configuration des conversions pour kWh
const KWH_CONVERSIONS = [
    { threshold: new Big(1000000000), unit: "TWh", factor: new Big(1000000000) },
    { threshold: new Big(1000000), unit: "GWh", factor: new Big(1000000) },
    { threshold: new Big(1000), unit: "MWh", factor: new Big(1000) },
    { threshold: new Big(0), unit: "kWh", factor: new Big(1) }
];

// Fonction principale de formatage intelligent
export const formatSmartValue = (
    value: Big, 
    _energyType: EnergyType, 
    baseUnit: BaseUnit
): FormattedValue => {
    if (!value || value.lte(0)) {
        return {
            formattedValue: "0",
            displayUnit: baseUnit === "kWh" ? "kWh" : "m³"
        };
    }

    if (baseUnit === "kWh") {
        return formatKwhValue(value);
    } else {
        return formatM3Value(value);
    }
};

// Formatage pour les valeurs en kWh avec conversion automatique
const formatKwhValue = (value: Big): FormattedValue => {
    for (const conversion of KWH_CONVERSIONS) {
        if (value.gte(conversion.threshold)) {
            const convertedValue = value.div(conversion.factor);
            return {
                formattedValue: formatNumber(convertedValue),
                displayUnit: conversion.unit
            };
        }
    }
    
    return {
        formattedValue: formatNumber(value),
        displayUnit: "kWh"
    };
};

// Formatage pour les valeurs en m³ (pas de conversion)
const formatM3Value = (value: Big): FormattedValue => {
    return {
        formattedValue: formatNumber(value),
        displayUnit: "m³"
    };
};

// Fonction de formatage des nombres avec gestion des décimales
const formatNumber = (value: Big): string => {
    const num = value.toNumber();
    
    if (num >= 1000) {
        // Pour les grandes valeurs, arrondir à l'entier ou 1 décimale
        return num >= 10000 ? 
            Math.round(num).toLocaleString('fr-FR') : 
            num.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    } else if (num >= 100) {
        // Centaines : 1 décimale max
        return num.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    } else if (num >= 10) {
        // Dizaines : 2 décimales max
        return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    } else if (num >= 1) {
        // Unités : 2 décimales max
        return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    } else if (num >= 0.01) {
        // Petites valeurs : 3 décimales max
        return num.toLocaleString('fr-FR', { maximumFractionDigits: 3 });
    } else if (num > 0) {
        // Très petites valeurs : notation scientifique si nécessaire
        return num < 0.001 ? 
            num.toExponential(2) : 
            num.toLocaleString('fr-FR', { maximumFractionDigits: 4 });
    } else {
        return "0";
    }
};

// Fonction utilitaire pour obtenir l'unité de base selon le type d'énergie et la configuration
export const getBaseUnitForEnergyType = (
    energyType: EnergyType,
    electricityUnit: BaseUnit,
    gasUnit: BaseUnit,
    waterUnit: BaseUnit,
    airUnit: BaseUnit
): BaseUnit => {
    switch (energyType) {
        case 'electricity':
            return electricityUnit;
        case 'gas':
            return gasUnit;
        case 'water':
            return waterUnit;
        case 'air':
            return airUnit;
        default:
            return 'kWh';
    }
};

// Fonction pour obtenir l'unité d'affichage de base selon la configuration
export const getDisplayUnit = (baseUnit: BaseUnit): string => {
    return baseUnit === "kWh" ? "kWh" : "m³";
};

// Fonction pour valider si une unité de base est supportée
export const isValidBaseUnit = (unit: string): unit is BaseUnit => {
    return unit === "kWh" || unit === "m3";
};

// Fonction de conversion pour les tests ou cas spéciaux
export const convertValue = (
    value: Big,
    fromUnit: BaseUnit,
    toUnit: BaseUnit
): Big => {
    // Si les unités sont les mêmes, pas de conversion
    if (fromUnit === toUnit) {
        return value;
    }
    
    // Dans ce système simplifié, on ne fait pas de conversion entre kWh et m³
    // car cela n'a pas de sens physique
    console.warn(`Conversion from ${fromUnit} to ${toUnit} is not supported`);
    return value;
}; 