/**
 * Utilitaires pour la gestion des types d'énergie et métriques dans CompareData
 */

// Types d'énergie supportés - aligné avec Mendix
export type EnergyType = "Elec" | "Gaz" | "Eau" | "Air";

// Types de métriques
export const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE", 
    IPE_KG: "IPE_kg",
    PROD: "Prod",
    PROD_KG: "Prod_kg",
    CUSTOM: "Custom"
} as const;

// Configuration pour chaque type d'énergie - aligné avec les logs Mendix
export interface EnergyConfig {
    name: string;
    color: string;
    unit: string;
    icon: string;
    description: string;
    ipeUnit: string; // Unité pour IPE
}

export const energyConfigs: Record<EnergyType, EnergyConfig> = {
    Elec: {
        name: "Électricité",
        color: "#38a13c",
        unit: "kWh",
        icon: "⚡",
        description: "Consommation électrique",
        ipeUnit: "kWh/pcs"
    },
    Gaz: {
        name: "Gaz",
        color: "#f9be01", 
        unit: "kWh", // ✅ Corrigé : gaz en kWh, pas m³
        icon: "🔥",
        description: "Consommation de gaz",
        ipeUnit: "kWh/pcs"
    },
    Eau: {
        name: "Eau",
        color: "#3293f3",
        unit: "m³", 
        icon: "💧",
        description: "Consommation d'eau",
        ipeUnit: "m³/pcs"
    },
    Air: {
        name: "Air comprimé",
        color: "#66d8e6",
        unit: "m³",
        icon: "💨", 
        description: "Consommation d'air comprimé",
        ipeUnit: "m³/pcs"
    }
};

/**
 * Détermine le type de métrique à partir du nom d'une variable
 * @param variableName - Nom de la variable
 * @returns Type de métrique détecté
 */
export function getMetricTypeFromName(variableName?: string): string {
    if (!variableName) return METRIC_TYPES.CUSTOM;
    
    const name = variableName.toLowerCase().trim();
    
    // Détection IPE
    if (name.includes("ipe")) {
        if (name.includes("kg") || name.includes("kilogram")) {
            return METRIC_TYPES.IPE_KG;
        }
        return METRIC_TYPES.IPE;
    }
    
    // Détection Production
    if (name.includes("prod") || name.includes("production")) {
        if (name.includes("kg") || name.includes("kilogram")) {
            return METRIC_TYPES.PROD_KG;
        }
        return METRIC_TYPES.PROD;
    }
    
    // Détection Consommation
    if (name.includes("conso") || name.includes("consommation") || 
        name.includes("kwh") || name.includes("wh")) {
        return METRIC_TYPES.CONSO;
    }
    
    return METRIC_TYPES.CUSTOM;
}

/**
 * Détermine le type d'énergie à partir du nom d'une variable
 * @param variableName - Nom de la variable
 * @returns Type d'énergie détecté - aligné avec Mendix
 */
export function getEnergyTypeFromName(variableName?: string): EnergyType {
    if (!variableName) return "Elec";
    
    const name = variableName.toLowerCase().trim();
    
    if (name.includes("gaz") || name.includes("gas")) {
        return "Gaz";
    }
    
    if (name.includes("eau") || name.includes("water")) {
        return "Eau";
    }
    
    if (name.includes("air") || name.includes("compressed")) {
        return "Air";
    }
    
    // Par défaut électricité
    return "Elec";
}

/**
 * Vérifie si une variable doit être affichée selon ses attributs
 * @param metricType - Type de métrique
 * @param energyType - Type d'énergie
 * @param viewMode - Mode d'affichage actuel
 * @returns true si la variable doit être affichée
 */
export function shouldDisplayVariable(
    metricType?: string,
    _energyType?: string,
    viewMode?: "energetic" | "ipe"
): boolean {
    if (!metricType) return false;
    
    // En mode énergétique, afficher uniquement les consommations
    if (viewMode === "energetic") {
        return metricType === METRIC_TYPES.CONSO;
    }
    
    // En mode IPE, afficher IPE et production
    if (viewMode === "ipe") {
        return metricType === METRIC_TYPES.IPE || 
               metricType === METRIC_TYPES.IPE_KG ||
               metricType === METRIC_TYPES.PROD ||
               metricType === METRIC_TYPES.PROD_KG;
    }
    
    return true;
}

/**
 * Obtient l'unité appropriée pour un type d'énergie et de métrique
 * @param energyType - Type d'énergie
 * @param metricType - Type de métrique
 * @returns Unité appropriée - aligné avec les logs Mendix
 */
export function getUnitForEnergyAndMetric(energyType: EnergyType, metricType: string): string {
    const config = energyConfigs[energyType];
    
    // Pour IPE_kg, retourner l'unité d'énergie par kg
    if (metricType === METRIC_TYPES.IPE_KG) {
        return `${config.unit}/kg`;
    }
    
    // Pour IPE (par pièce), retourner l'unité d'énergie par pièce
    if (metricType === METRIC_TYPES.IPE) {
        return `${config.unit}/pcs`; // ✅ Corrigé : IPE par pièce, pas par kg
    }
    
    // Pour la production en kg
    if (metricType === METRIC_TYPES.PROD_KG) {
        return "kg";
    }
    
    // Pour la production normale, utiliser l'unité de l'énergie
    if (metricType === METRIC_TYPES.PROD) {
        return config.unit;
    }
    
    // Pour la consommation, utiliser l'unité de base
    return config.unit;
}

/**
 * Détermine le type de métrique approprié selon le mode d'affichage
 * @param viewMode - Mode d'affichage ("energetic" ou "ipe")
 * @returns Type de métrique approprié
 */
export function getMetricTypeFromViewMode(viewMode: "energetic" | "ipe"): string {
    if (viewMode === "ipe") {
        return METRIC_TYPES.IPE; // IPE par pièce
    }
    return METRIC_TYPES.CONSO; // Consommation
}

// Note: getAssetColor() supprimé - utiliser colorUtils.ts à la place