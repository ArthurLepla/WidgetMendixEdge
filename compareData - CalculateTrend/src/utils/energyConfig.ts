import { EnergyType, EnergyConfig } from "./types";

// Palette de base avec 16 couleurs soigneusement choisies
export const ENERGY_CONFIG: Record<EnergyType, EnergyConfig> = {
    electricity: {
        label: "Électricité",
        color: "#38a13c",
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)",
        unit: "kWh",
        ipeUnit: "kWh/pièce"
    },
    gas: {
        label: "Gaz",
        color: "#F9BE01",
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)",
        unit: "m³",
        ipeUnit: "m³/pièce"
    },
    water: {
        label: "Eau",
        color: "#3293f3",
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)",
        unit: "m³",
        ipeUnit: "m³/pièce"
    },
    air: {
        label: "Air",
        color: "#66D8E6",
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)",
        unit: "m³",
        ipeUnit: "m³/pièce"
    }
};

export const getUnit = (type: EnergyType, viewMode: "energetic" | "ipe"): string => {
    const config = ENERGY_CONFIG[type];
    return viewMode === "ipe" ? config.ipeUnit : config.unit;
};

export const getIPEUnit = (type: EnergyType): string => {
    const config = ENERGY_CONFIG[type];
    return config.ipeUnit;
}; 