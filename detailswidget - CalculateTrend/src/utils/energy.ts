export interface EnergyConfig {
    label: string;
    color: string;
    unit: string;
    BackgroundIconColor: string;
    ipeUnit: string;
}

// Types de variables basés sur les enums Mendix
export const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE",
    IPE_KG: "IPE_kg",
    PROD: "Prod",
    PROD_KG: "Prod_kg",
    CUSTOM: "Custom"
} as const;

export const ENERGY_TYPES = {
    ELEC: "Elec",
    GAZ: "Gaz",
    EAU: "Eau",
    AIR: "Air",
    NONE: "None"
} as const;

export type MetricType = typeof METRIC_TYPES[keyof typeof METRIC_TYPES];
export type EnergyType = typeof ENERGY_TYPES[keyof typeof ENERGY_TYPES];

// Fonction pour déterminer si une variable doit être affichée selon le mode
export function shouldDisplayVariable(
    metricType: string | undefined,
    viewMode: "energetic" | "ipe"
): boolean {
    // Règles strictes pour éviter les mélanges et les sommes inattendues
    if (viewMode === "ipe") {
        if (!metricType) return false;
        const normalized = metricType.trim();
        return normalized === METRIC_TYPES.IPE || normalized === METRIC_TYPES.IPE_KG;
    }

    if (viewMode === "energetic") {
        // Par défaut, la datasource principale correspond à la consommation.
        // Si `MetricType` est absent, on considère que c'est de la Conso pour ne pas masquer les séries.
        if (!metricType) return true;
        const normalized = metricType.trim();
        return normalized === METRIC_TYPES.CONSO || normalized.toLowerCase().includes("conso");
    }

    return false;
}

// Fonction pour obtenir le type de métrique à partir d'un nom (fallback)
export function getMetricTypeFromName(name: string | undefined): MetricType | undefined {
    if (!name) return undefined;
    
    const normalizedName = name.toLowerCase().trim();
    
    if (normalizedName.includes("ipe_kg")) return METRIC_TYPES.IPE_KG;
    if (normalizedName.includes("ipe")) return METRIC_TYPES.IPE;
    if (normalizedName.includes("prod_kg")) return METRIC_TYPES.PROD_KG;
    if (normalizedName.includes("prod")) return METRIC_TYPES.PROD;
    if (normalizedName.includes("conso") || normalizedName.includes("consumption")) 
        return METRIC_TYPES.CONSO;
    
    return undefined;
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
