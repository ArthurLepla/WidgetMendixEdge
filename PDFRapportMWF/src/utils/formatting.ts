import { Big } from "big.js";
import { KWH_TO_MWH_THRESHOLD, MWH_DECIMAL_PLACES, KWH_DECIMAL_PLACES } from "../constants/config";

/**
 * Parse une valeur en nombre, gère différents types d'entrée
 * @param value - Valeur à convertir en nombre
 */
export function parseNumericValue(value: any): number {
    let numValue: number = 0;

    if (typeof value === "number") {
        numValue = value;
    } else if (value instanceof Big) {
        numValue = Number(value.toString());
    } else if (typeof value === "string") {
        const parsed = parseFloat(value.replace(',', '.'));
        numValue = isNaN(parsed) ? 0 : parsed;
    } else {
        numValue = 0;
    }
    return numValue;
}

/**
 * Formate une valeur énergétique selon le type d'énergie
 * @param valueInKwh - Valeur en kWh ou équivalent
 * @param energyType - Type d'énergie (Elec, Gaz, Air)
 */
export function formatEnergyValue(valueInKwh: number | undefined, energyType?: string): string {
    if (valueInKwh === undefined) return "-";
    if (valueInKwh === Infinity) return "∞";
    if (isNaN(valueInKwh)) return "N/A";

    // Pour Gaz et Air, afficher en m³
    if (energyType === "Gaz" || energyType === "Air") {
        return `${valueInKwh.toFixed(KWH_DECIMAL_PLACES)} m³`;
    }

    // Pour l'électricité, afficher en kWh/MWh
    if (Math.abs(valueInKwh) >= KWH_TO_MWH_THRESHOLD) {
        return `${(valueInKwh / 1000).toFixed(MWH_DECIMAL_PLACES)} MWh`;
    }
    return `${valueInKwh.toFixed(KWH_DECIMAL_PLACES)} kWh`;
}

/**
 * Formate une valeur IPE selon le type d'énergie
 * @param ipe - Valeur IPE
 * @param energyType - Type d'énergie (Elec, Gaz, Air)
 */
export function formatIpeValue(ipe: number | undefined, energyType?: string): string {
    if (ipe === undefined) return "-";
    if (ipe === Infinity) return "∞";
    if (isNaN(ipe)) return "N/A";

    // Pour Gaz et Air, afficher en m³/pièce
    if (energyType === "Gaz" || energyType === "Air") {
        if (Math.abs(ipe) >= 1000) {
            return `${(ipe / 1000).toFixed(MWH_DECIMAL_PLACES + 1)} km³/pièce`;
        }
        return `${ipe.toFixed(KWH_DECIMAL_PLACES + 1)} m³/pièce`;
    }

    // Pour l'électricité, afficher en kWh/MWh par pièce
    if (Math.abs(ipe) >= KWH_TO_MWH_THRESHOLD) {
        return `${(ipe / 1000).toFixed(MWH_DECIMAL_PLACES + 1)} MWh/pièce`;
    }
    return `${ipe.toFixed(KWH_DECIMAL_PLACES + 1)} kWh/pièce`;
}

/**
 * Fonction pour tronquer les noms trop longs pour éviter les débordements
 * @param name - Nom à tronquer
 * @param maxLength - Longueur maximale
 */
export function truncateName(name: string, maxLength: number = 25): string {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
}

/**
 * Fonction pour formater la période d'analyse
 * @param dateStart - Date de début
 * @param dateEnd - Date de fin
 */
export function formatDatePeriod(dateStart?: Date, dateEnd?: Date): string {
    if (!dateStart && !dateEnd) {
        return "Période non spécifiée";
    }
    
    const startStr = dateStart ? dateStart.toLocaleDateString('fr-FR') : "Date non spécifiée";
    const endStr = dateEnd ? dateEnd.toLocaleDateString('fr-FR') : "Date non spécifiée";
    
    if (dateStart && dateEnd) {
        return `Période du ${startStr} au ${endStr}`;
    } else if (dateStart) {
        return `À partir du ${startStr}`;
    } else if (dateEnd) {
        return `Jusqu'au ${endStr}`;
    }
    
    return "Période non spécifiée";
}

/**
 * Validation des dates
 * @param startDate - Date de début
 * @param endDate - Date de fin
 */
export function validateDates(startDate?: Date, endDate?: Date): string | null {
    if (!startDate && !endDate) return null;
    
    if (startDate && endDate) {
        if (startDate > endDate) {
            return "La date de début doit être antérieure à la date de fin";
        }
        
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
            return "La période ne peut pas dépasser 365 jours";
        }
    }
    
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours dans le futur
    
    if (startDate && startDate > futureLimit) {
        return "La date de début ne peut pas être trop éloignée dans le futur";
    }
    
    if (endDate && endDate > futureLimit) {
        return "La date de fin ne peut pas être trop éloignée dans le futur";
    }
    
    return null;
} 