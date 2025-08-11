/**
 * Utilitaires pour la gestion des types d'énergie et métriques dans CompareData
 */

// Types d'énergie supportés
export type EnergyType = "elec" | "gaz" | "eau" | "air";

// Types de métriques
export const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE", 
    IPE_KG: "IPE_kg",
    PROD: "Prod",
    PROD_KG: "Prod_kg",
    CUSTOM: "Custom"
} as const;

// Configuration pour chaque type d'énergie
export interface EnergyConfig {
    name: string;
    color: string;
    unit: string;
    icon: string;
    description: string;
}

export const energyConfigs: Record<EnergyType, EnergyConfig> = {
    elec: {
        name: "Électricité",
        color: "#38a13c",
        unit: "kWh",
        icon: "⚡",
        description: "Consommation électrique"
    },
    gaz: {
        name: "Gaz",
        color: "#f9be01", 
        unit: "m³",
        icon: "🔥",
        description: "Consommation de gaz"
    },
    eau: {
        name: "Eau",
        color: "#3293f3",
        unit: "m³", 
        icon: "💧",
        description: "Consommation d'eau"
    },
    air: {
        name: "Air comprimé",
        color: "#66d8e6",
        unit: "m³",
        icon: "💨", 
        description: "Consommation d'air comprimé"
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
 * @returns Type d'énergie détecté
 */
export function getEnergyTypeFromName(variableName?: string): EnergyType {
    if (!variableName) return "elec";
    
    const name = variableName.toLowerCase().trim();
    
    if (name.includes("gaz") || name.includes("gas")) {
        return "gaz";
    }
    
    if (name.includes("eau") || name.includes("water")) {
        return "eau";
    }
    
    if (name.includes("air") || name.includes("compressed")) {
        return "air";
    }
    
    // Par défaut électricité
    return "elec";
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
 * @returns Unité appropriée
 */
export function getUnitForEnergyAndMetric(energyType: EnergyType, metricType: string): string {
    const config = energyConfigs[energyType];
    
    // Pour IPE, toujours retourner l'unité d'énergie par kg
    if (metricType === METRIC_TYPES.IPE) {
        return `${config.unit}/kg`;
    }
    
    if (metricType === METRIC_TYPES.IPE_KG) {
        return `${config.unit}/kg`;
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
 * Obtient la couleur appropriée pour un asset dans un graphique de comparaison
 * @param index - Index de l'asset dans la liste
 * @param energyType - Type d'énergie (optionnel)
 * @returns Couleur hex
 */
export function getAssetColor(index: number, energyType?: EnergyType): string {
    // Si un type d'énergie est spécifié, utiliser sa couleur comme base
    if (energyType && energyConfigs[energyType]) {
        const baseColor = energyConfigs[energyType].color;
        // Varier l'opacité ou la teinte selon l'index
        const opacity = Math.max(0.6, 1 - (index * 0.2));
        return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
    
    // Palette de couleurs par défaut pour la comparaison
    const defaultColors = [
        "#38a13c", // Vert
        "#f9be01", // Jaune
        "#3293f3", // Bleu
        "#66d8e6", // Cyan
        "#e74c3c", // Rouge
        "#9b59b6", // Violet
        "#f39c12", // Orange
        "#1abc9c", // Turquoise
        "#34495e", // Gris foncé
        "#95a5a6"  // Gris clair
    ];
    
    return defaultColors[index % defaultColors.length];
}