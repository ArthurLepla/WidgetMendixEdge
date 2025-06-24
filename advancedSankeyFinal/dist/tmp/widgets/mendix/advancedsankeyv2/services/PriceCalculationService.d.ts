/**
 * Service de calcul des prix et des coûts
 * Centralise toute la logique de prix pour éliminer les redondances
 */
export interface PriceData {
    donneesEntity: any;
    priceAttribute: any;
    priceEnergyTypeAttribute: any;
    dateDebut: any;
    dateFin: any;
}
export interface PriceResult {
    price: number;
    isValidForPeriod: boolean;
}
export interface CostResult {
    cost: number;
    unit: string;
    isValidForPeriod: boolean;
}
export declare class PriceCalculationService {
    /**
     * Mapping des types d'énergie entre sélection et enum Mendix
     */
    private static readonly ENERGY_TYPE_MAPPING;
    /**
     * Trouve le prix pour un type d'énergie et une période donnée
     */
    static findPriceForEnergy(priceData: PriceData, selectedEnergy: string, sankeyStartDate?: Date, sankeyEndDate?: Date): PriceResult | undefined;
    /**
     * Calcule le coût pour une valeur et un type d'énergie
     */
    static calculateCostForValue(value: number, energyType: string, priceData: PriceData, currency: string, sankeyStartDate?: Date, sankeyEndDate?: Date): CostResult | undefined;
    /**
     * Vérifie si des prix valides existent pour une liste de nœuds
     */
    static hasValidPricesForNodes(nodes: any[], energyType: string, priceData: PriceData, currency: string, sankeyStartDate?: Date, sankeyEndDate?: Date): boolean;
    /**
     * Crée un objet PriceData unifié depuis les props Mendix
     */
    static createPriceDataFromProps(props: any): PriceData | null;
    private static validatePriceData;
    private static validatePriceItem;
}
//# sourceMappingURL=PriceCalculationService.d.ts.map