/**
 * Service de calcul des prix et des coûts
 * Centralise toute la logique de prix pour éliminer les redondances
 */

import { ValueStatus } from "mendix";

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

export class PriceCalculationService {
  
  /**
   * Mapping des types d'énergie entre sélection et enum Mendix
   */
  private static readonly ENERGY_TYPE_MAPPING: { [key: string]: string } = {
    'elec': 'Elec',
    'gaz': 'Gaz', 
    'eau': 'Eau',
    'air': 'Air'
  };

  /**
   * Trouve le prix pour un type d'énergie et une période donnée
   */
  static findPriceForEnergy(
    priceData: PriceData,
    selectedEnergy: string,
    sankeyStartDate?: Date,
    sankeyEndDate?: Date
  ): PriceResult | undefined {
    
    if (!this.validatePriceData(priceData, sankeyStartDate, sankeyEndDate)) {
      return undefined;
    }

    const targetEnergyType = this.ENERGY_TYPE_MAPPING[selectedEnergy];
    if (!targetEnergyType) {
      console.warn(`⚠️ Type d'énergie non supporté: ${selectedEnergy}`);
      return undefined;
    }

    // Parcourir les items de prix
    for (const item of priceData.donneesEntity.items) {
      const priceResult = this.validatePriceItem(
        item, 
        priceData, 
        targetEnergyType, 
        sankeyStartDate!, 
        sankeyEndDate!
      );
      
      if (priceResult) {
        return priceResult;
      }
    }

    return undefined;
  }

  /**
   * Calcule le coût pour une valeur et un type d'énergie
   */
  static calculateCostForValue(
    value: number,
    energyType: string,
    priceData: PriceData,
    currency: string,
    sankeyStartDate?: Date,
    sankeyEndDate?: Date
  ): CostResult | undefined {
    
    if (value === 0) {
      return {
        cost: 0,
        unit: currency,
        isValidForPeriod: true
      };
    }

    const priceResult = this.findPriceForEnergy(
      priceData, 
      energyType, 
      sankeyStartDate, 
      sankeyEndDate
    );
    
    if (!priceResult) {
      return undefined;
    }

    return {
      cost: value * priceResult.price,
      unit: currency,
      isValidForPeriod: priceResult.isValidForPeriod
    };
  }

  /**
   * Vérifie si des prix valides existent pour une liste de nœuds
   */
  static hasValidPricesForNodes(
    nodes: any[],
    energyType: string,
    priceData: PriceData,
    currency: string,
    sankeyStartDate?: Date,
    sankeyEndDate?: Date
  ): boolean {
    
    return nodes.some(node => {
      const costResult = this.calculateCostForValue(
        node.value,
        energyType,
        priceData,
        currency,
        sankeyStartDate,
        sankeyEndDate
      );
      return costResult?.isValidForPeriod;
    });
  }

  /**
   * Crée un objet PriceData unifié depuis les props Mendix
   */
  static createPriceDataFromProps(props: any): PriceData | null {
    if (!props.priceDataSource?.items?.length) {
      return null;
    }

    return {
      donneesEntity: props.priceDataSource,
      priceAttribute: props.priceAttribute,
      priceEnergyTypeAttribute: props.priceEnergyTypeAttribute,
      dateDebut: props.priceStartDateAttribute,
      dateFin: props.priceEndDateAttribute
    };
  }

  // === MÉTHODES PRIVÉES ===

  private static validatePriceData(
    priceData: PriceData,
    sankeyStartDate?: Date,
    sankeyEndDate?: Date
  ): boolean {
    
    if (!priceData?.donneesEntity?.items) {
      console.warn("⚠️ Données de prix non disponibles");
      return false;
    }

    // Si les dates ne sont pas fournies, considérer que les prix sont valides par défaut
    if (!sankeyStartDate || !sankeyEndDate) {
      return true;
    }

    return true;
  }

  private static validatePriceItem(
    item: any,
    priceData: PriceData,
    targetEnergyType: string,
    sankeyStartDate: Date,
    sankeyEndDate: Date
  ): PriceResult | undefined {
    
    const dateDebut = priceData.dateDebut?.get(item);
    const dateFin = priceData.dateFin?.get(item);
    const energyTypeAttr = priceData.priceEnergyTypeAttribute?.get(item);
    const priceValue = priceData.priceAttribute?.get(item);
    
    // Vérifier si toutes les données sont valides
    if (dateDebut?.status === ValueStatus.Available && 
        dateFin?.status === ValueStatus.Available &&
        energyTypeAttr?.status === ValueStatus.Available &&
        priceValue?.status === ValueStatus.Available) {
        
      const startDate = dateDebut.value;
      const endDate = dateFin.value;
      const itemEnergyType = energyTypeAttr.value;
      
      // Vérifier que les dates ne sont pas null ou undefined avant comparaison
      if (startDate == null || endDate == null) {
        console.warn("⚠️ Dates de prix invalides (null/undefined)");
        return undefined;
      }
      
      // Vérifier le type d'énergie (insensible à la casse)
      if (itemEnergyType?.toLowerCase() === targetEnergyType.toLowerCase()) {
        // Si les dates Sankey ne sont pas définies, valider par défaut
        const isValidPeriod = !sankeyStartDate || !sankeyEndDate ? true : (startDate <= sankeyStartDate && endDate >= sankeyEndDate);
        
        if (isValidPeriod) {
          return {
            price: Number(priceValue.value.toString()),
            isValidForPeriod: true
          };
        }
      }
    }

    return undefined;
  }
} 