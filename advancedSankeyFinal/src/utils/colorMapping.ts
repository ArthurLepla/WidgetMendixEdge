import { Zap, Flame, Droplet, Wind } from "lucide-react";
import { EnergyConfig, EnergyConfigs } from "../types/Widget.types";

/**
 * Configuration des couleurs et icônes pour chaque type d'énergie
 * Conforme aux standards du système énergétique
 */
export const ENERGY_CONFIGS: EnergyConfigs = {
    elec: {
        color: "#38a13c",
        iconColor: "#38a13c", 
        titleColor: "#38a13c",
        unit: "kWh",
        title: "Distribution des flux électriques"
    },
    gaz: {
        color: "#F9BE01",
        iconColor: "#F9BE01",
        titleColor: "#F9BE01", 
        unit: "m³",
        title: "Distribution des flux de gaz"
    },
    eau: {
        color: "#2196F3",
        iconColor: "#2196F3",
        titleColor: "#2196F3",
        unit: "m³", 
        title: "Distribution des flux d'eau"
    },
    air: {
        color: "#9E9E9E",
        iconColor: "#9E9E9E",
        titleColor: "#9E9E9E",
        unit: "m³",
        title: "Distribution des flux d'air comprimé"
    }
};

/**
 * Icônes pour chaque type d'énergie
 */
export const ENERGY_ICONS = {
    elec: Zap,
    gaz: Flame, 
    eau: Droplet,
    air: Wind
};

/**
 * Couleurs des nœuds par niveau hiérarchique
 */
export const HIERARCHY_COLORS = {
    Usine: "#2196F3",    // Bleu moderne
    Atelier: "#4CAF50",  // Vert moderne  
    Machine: "#FF9800",  // Orange moderne
    default: "#757575"   // Gris par défaut
};

/**
 * Couleur par défaut des liens
 */
export const LINK_COLOR = "#E0E0E0";

/**
 * Utilitaires pour la gestion des couleurs
 */
export class ColorMapper {
    
    /**
     * Obtient la configuration d'une énergie
     */
    static getEnergyConfig(energyType: string): EnergyConfig {
        return ENERGY_CONFIGS[energyType] || {
            color: "#757575",
            iconColor: "#757575", 
            titleColor: "#757575",
            unit: "units",
            title: `Distribution des flux ${energyType}`
        };
    }
    
    /**
     * Obtient la couleur d'un nœud selon son niveau hiérarchique
     */
    static getNodeColor(nodeLevel?: string): string {
        if (!nodeLevel) return HIERARCHY_COLORS.default;
        return HIERARCHY_COLORS[nodeLevel as keyof typeof HIERARCHY_COLORS] || HIERARCHY_COLORS.default;
    }
    
    /**
     * Obtient la couleur d'un lien selon le type d'énergie
     */
    static getLinkColor(energyType?: string): string {
        if (!energyType) return LINK_COLOR;
        return ENERGY_CONFIGS[energyType]?.color || LINK_COLOR;
    }
    
    /**
     * Génère une couleur avec transparence
     */
    static withOpacity(color: string, opacity: number): string {
        // Conversion hex vers rgba si nécessaire
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16); 
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}