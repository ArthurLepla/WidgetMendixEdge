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
export declare function formatEnergyValue(value: number, energyType: string, customUnit?: string): ConvertedValue;
export declare function formatValue(value: number): string;
export declare function calculatePercentage(value: number, total: number): string;
export declare function calculateCost(value: number, energyType: string, priceData: PriceData, currency?: string): CostValue | null;
export declare function formatCost(cost: number, currency?: string): string;
/**
 * Normalise les types d'énergie pour assurer la cohérence
 * @param energyType - Le type d'énergie brut
 * @returns Le type d'énergie normalisé ou undefined si non reconnu
 */
export declare function normalizeEnergyType(energyType: string | undefined): string | undefined;
/**
 * Valide et nettoie un nom de nœud
 * @param name - Le nom brut du nœud
 * @returns Le nom nettoyé ou null si invalide
 */
export declare function validateNodeName(name: string | undefined): string | null;
/**
 * Valide une valeur numérique de nœud
 * @param value - La valeur brute
 * @returns La valeur numérique ou null si invalide
 */
export declare function validateNodeValue(value: any): number | null;
/**
 * Inférence du type d'énergie à partir du nom du nœud
 * Utilisé pour les nœuds ETH et Machine qui n'ont pas de type explicite
 */
export declare function inferEnergyTypeFromName(name: string): string | undefined;
export {};
//# sourceMappingURL=unitConverter.d.ts.map