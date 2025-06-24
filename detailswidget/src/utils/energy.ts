export interface EnergyConfig {
    label: string;
    color: string;
    unit: string;
    BackgroundIconColor: string;
    ipeUnit: string;
}

export const energyConfigs: Record<string, EnergyConfig> = {
    electricity: {
        label: "Électricité",
        color: "#38a13c",
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)",
        unit: "kWh",
        ipeUnit: "pièces/kWh"
    },
    gas: {
        label: "Gaz",
        color: "#F9BE01",
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    water: {
        label: "Eau",
        color: "#3293f3",
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    air: {
        label: "Air",
        color: "#66D8E6",
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    IPE: {
        label: "IPE",
        color: "#be49ec",
        BackgroundIconColor: "rgba(190, 73, 236, 0.1)",
        unit: "pièces/kWh",
        ipeUnit: "pièces/kWh"
    }
};

// Types pour les unités de base
export type BaseUnit = "auto" | "kWh" | "m3";

// Interface pour les résultats de conversion
export interface UnitConversion {
    value: number;
    unit: string;
}

/**
 * Détermine l'unité appropriée selon le baseUnit et energyType
 */
export function getSmartUnit(value: number, energyType: string, baseUnit: BaseUnit): UnitConversion {
    // Mode automatique : comportement précédent
    if (baseUnit === "auto") {
        const config = energyConfigs[energyType];
        return {
            value,
            unit: config?.unit || "kWh"
        };
    }
    
    // Mode kWh : conversion intelligente selon l'ordre de grandeur
    if (baseUnit === "kWh") {
        if (value >= 1000000000) { // >= 1 TWh
            return {
                value: value / 1000000000,
                unit: "TWh"
            };
        } else if (value >= 1000000) { // >= 1 GWh
            return {
                value: value / 1000000,
                unit: "GWh"
            };
        } else if (value >= 1000) { // >= 1 MWh
            return {
                value: value / 1000,
                unit: "MWh"
            };
        } else {
            return {
                value,
                unit: "kWh"
            };
        }
    }
    
    // Mode m³ : aucune conversion
    if (baseUnit === "m3") {
        return {
            value,
            unit: "m³"
        };
    }
    
    // Fallback
    return {
        value,
        unit: "kWh"
    };
}

/**
 * Formate une valeur avec conversion d'unité intelligente
 */
export function formatSmartValue(value: number, energyType: string, baseUnit: BaseUnit, decimals: number = 2): string {
    const conversion = getSmartUnit(value, energyType, baseUnit);
    const roundedValue = Math.round(conversion.value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    return `${roundedValue.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    })} ${conversion.unit}`;
}

/**
 * Obtient la configuration d'énergie avec unité adaptée selon baseUnit
 */
export function getAdaptedEnergyConfig(energyType: string, baseUnit: BaseUnit): EnergyConfig {
    const baseConfig = energyConfigs[energyType] || energyConfigs.electricity;
    
    if (baseUnit === "auto") {
        return baseConfig;
    }
    
    // Adapter l'unité selon le baseUnit
    const adaptedUnit = baseUnit === "kWh" ? "kWh" : "m³";
    const adaptedIpeUnit = baseUnit === "kWh" ? "pièces/kWh" : "pièces/m³";
    
    return {
        ...baseConfig,
        unit: adaptedUnit,
        ipeUnit: adaptedIpeUnit
    };
}
