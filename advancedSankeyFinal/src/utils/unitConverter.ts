interface ConvertedValue {
    value: number;
    unit: string;
}

interface PriceData {
    prixElec?: number;
    prixGaz?: number;
    prixEau?: number;
    prixAir?: number;
    dateDebut?: Date;
    dateFin?: Date;
}

interface CostValue {
    value: number;
    originalValue: number;
    originalUnit: string;
    cost: number;
    currency: string;
}

export function formatEnergyValue(value: number, energyType: string, customUnit?: string): ConvertedValue {
    // Si une unité personnalisée est spécifiée, l'utiliser sans conversion
    if (customUnit) {
        return { value, unit: customUnit };
    }

    // Pour l'électricité, conversion automatique kWh -> MWh -> GWh
    if (energyType === 'elec') {
        if (value >= 1_000_000) {
            return {
                value: value / 1_000_000,
                unit: 'GWh'
            };
        } else if (value >= 1_000) {
            return {
                value: value / 1_000,
                unit: 'MWh'
            };
        }
        return {
            value,
            unit: 'kWh'
        };
    }

    // Pour les autres types d'énergie, utiliser m³
    return {
        value,
        unit: 'm³'
    };
}

export function formatValue(value: number): string {
    // Handle zero values explicitly
    if (value === 0) {
        return "0";
    }
    // Formater le nombre avec 2 décimales maximum et supprimer les zéros inutiles
    return Number(value.toFixed(2)).toString();
}

export function calculatePercentage(value: number, total: number): string {
    if (total === 0) return "0%";
    const percentage = (value / total) * 100;
    // Arrondir à 1 décimale
    return `${Number(percentage.toFixed(1))}%`;
}

export function calculateCost(
    value: number,
    energyType: string,
    priceData: PriceData,
    currency: string = "€"
): CostValue | null {
    // Vérifier si nous avons un prix valide pour ce type d'énergie
    let price: number | undefined;
    let originalUnit: string;

    switch (energyType) {
        case "elec":
            price = priceData.prixElec;
            // Convertir en kWh si nécessaire pour le calcul
            if (value >= 1_000_000) {
                value = value * 1_000_000; // GWh to kWh
                originalUnit = "GWh";
            } else if (value >= 1_000) {
                value = value * 1_000; // MWh to kWh
                originalUnit = "MWh";
            } else {
                originalUnit = "kWh";
            }
            break;
        case "gaz":
            price = priceData.prixGaz;
            originalUnit = "m³";
            break;
        case "eau":
            price = priceData.prixEau;
            originalUnit = "m³";
            break;
        case "air":
            price = priceData.prixAir;
            originalUnit = "m³";
            break;
        default:
            return null;
    }

    if (price === undefined) {
        return null;
    }

    const cost = value * price;

    return {
        value: value,
        originalValue: value,
        originalUnit,
        cost,
        currency
    };
}

export function formatCost(cost: number, currency: string = "€"): string {
    return `${Number(cost.toFixed(2)).toLocaleString()} ${currency}`;
}

/**
 * Normalise les types d'énergie pour assurer la cohérence
 * @param energyType - Le type d'énergie brut
 * @returns Le type d'énergie normalisé ou undefined si non reconnu
 */
export function normalizeEnergyType(energyType: string | undefined): string | undefined {
    if (!energyType) return undefined;
    
    const typeLower = energyType.toLowerCase().trim();
    
    if (typeLower.includes('elec') || typeLower.includes('électr') || typeLower.includes('electr')) {
        return 'elec';
    } else if (typeLower.includes('gaz') || typeLower.includes('gas')) {
        return 'gaz';
    } else if (typeLower.includes('eau') || typeLower.includes('water')) {
        return 'eau';
    } else if (typeLower.includes('air') || typeLower.includes('compress')) {
        return 'air';
    }
    
    return undefined;
}

/**
 * Valide et nettoie un nom de nœud
 * @param name - Le nom brut du nœud
 * @returns Le nom nettoyé ou null si invalide
 */
export function validateNodeName(name: string | undefined): string | null {
    if (!name || typeof name !== 'string') return null;
    
    const cleanName = name.trim();
    if (cleanName === "" || cleanName === "empty" || cleanName.toLowerCase() === "null") {
        return null;
    }
    
    return cleanName;
}

/**
 * Valide une valeur numérique de nœud
 * @param value - La valeur brute
 * @returns La valeur numérique ou null si invalide
 */
export function validateNodeValue(value: any): number | null {
    if (value === undefined || value === null) return null;
    
    const numValue = Number(value);
    if (isNaN(numValue) || !isFinite(numValue)) return null;
    
    return numValue;
}

/**
 * Inférence du type d'énergie à partir du nom du nœud
 * Utilisé pour les nœuds ETH et Machine qui n'ont pas de type explicite
 */
export function inferEnergyTypeFromName(name: string): string | undefined {
    const nameLower = name.toLowerCase();
    
    // Pour les nœuds ETH avec des codes spécifiques à l'air comprimé
    if (nameLower.includes('_ac') || nameLower.includes('tar_ac') || 
        nameLower.includes('zr') || nameLower.includes('ga') || 
        nameLower.includes('compres') || nameLower.includes('air_comprime')) {
        return 'air';
    }
    
    // Rechercher des mots-clés pour l'électricité
    if (nameLower.includes('elec') || nameLower.includes('électr') || 
        nameLower.includes('electr') || nameLower.includes('eth_') || 
        nameLower.includes('bat_') || nameLower.includes('eclairage') ||
        nameLower.includes('jantes') || nameLower.includes('roues') || 
        nameLower.includes('viroles') || nameLower.includes('fluo')) {
        return 'elec';
    }
    
    // Rechercher des mots-clés pour le gaz
    if (nameLower.includes('gaz') || nameLower.includes('gas') || 
        nameLower.includes('chaufferie')) {
        return 'gaz';
    }
    
    // Rechercher des mots-clés pour l'eau
    if (nameLower.includes('eau') || nameLower.includes('water') || 
        nameLower.includes('puits') || nameLower.includes('refriger') ||
        nameLower.includes('sdm')) {
        return 'eau';
    }
    
    // Par défaut, pour tous les autres nœuds ETH non spécifiques
    if (nameLower.startsWith('eth_')) {
        return 'elec';
    }
    
    return undefined;
} 