/**
 * Types utilitaires pour CompareData
 * Compatible avec les composants existants
 */

// Note: EnergyType est maintenant défini dans energy.ts pour éviter la duplication

// Modes d'affichage
export type ViewMode = "energetic" | "ipe";

// Unités de base
export type BaseUnit = "auto" | "kWh" | "m3";

// Interface pour les données de machine (compatible avec LineChart existant)
export interface MachineData {
    name: string;
    timestamps: Date[];
    values: Big[];
}

// Interface pour les statistiques de machine (compatible avec MachineCard existant)
export interface MachineStats {
    name: string;
    currentValue: Big;
    maxValue: Big;
    minValue: Big;
    avgValue: Big;
    sumValue: Big;
    // Propriétés pour IPE
    totalConsommationIPE?: Big;
    totalProduction?: Big;
    ipeValue?: Big;
}