// src/utils/smartUnitUtils.ts
import { ListValue, ListAttributeValue, ValueStatus } from "mendix";

// Types Smart compatibles avec DetailsWidget
export type SmartMetricType = 'Conso' | 'Prod' | 'Prod_kg' | 'IPE' | 'IPE_kg';
export type SmartEnergyType = 'Elec' | 'Gaz' | 'Eau' | 'Air' | 'None';

export interface SmartVariableData {
    name: string;
    unit: string;
    metricType: SmartMetricType;
    energyType: SmartEnergyType;
    isActive: boolean;
}

// Mapping des types d'énergie widget vers Smart
export const WIDGET_TO_SMART_ENERGY_MAPPING: Record<string, SmartEnergyType> = {
    'electricity': 'Elec',
    'gas': 'Gaz',
    'water': 'Eau',
    'air': 'Air',
    'Elec': 'Elec',
    'Gaz': 'Gaz',
    'Eau': 'Eau',
    'Air': 'Air'
};

/**
 * Extrait les données Smart Variables depuis les DataSources Mendix
 * Adapté de DetailsWidget pour CompareData
 */
export function extractSmartVariablesData(
    assetVariablesDataSource: ListValue | undefined,
    variableNameAttr: ListAttributeValue<string> | undefined,
    variableUnitAttr: ListAttributeValue<string> | undefined,
    variableMetricTypeAttr: ListAttributeValue<string> | undefined,
    variableEnergyTypeAttr: ListAttributeValue<string> | undefined
): SmartVariableData[] {
    
    if (assetVariablesDataSource?.status !== ValueStatus.Available || 
        !variableNameAttr || !variableUnitAttr || !variableMetricTypeAttr) {
        return [];
    }

    const variables: SmartVariableData[] = [];

    assetVariablesDataSource.items?.forEach(item => {
        const name = variableNameAttr.get(item)?.value;
        const unit = variableUnitAttr.get(item)?.value;
        const metricType = variableMetricTypeAttr.get(item)?.value as SmartMetricType;
        const energyType = variableEnergyTypeAttr?.get(item)?.value as SmartEnergyType || 'None';

        if (name && unit && metricType) {
            variables.push({
                name,
                unit,
                metricType,
                energyType,
                isActive: true // Supposer active par défaut
            });
        }
    });

    return variables;
}

/**
 * Trouve l'unité d'une variable Smart spécifique
 */
export function findSmartVariableUnit(
    variables: SmartVariableData[],
    metricType: SmartMetricType,
    energyType: SmartEnergyType
): string {
    const variable = variables.find(v => 
        v.metricType === metricType && 
        v.energyType === energyType && 
        v.isActive
    );
    return variable?.unit || '';
}

/**
 * Récupère les variantes IPE disponibles pour une énergie donnée
 * Retourne les unités IPE et IPE_kg disponibles
 */
export function getIPEVariantsFromVariables(
    variables: SmartVariableData[],
    targetEnergy: SmartEnergyType
): Array<{ metricType: SmartMetricType; energyType: SmartEnergyType; unit: string }> {
    
    if (!variables || variables.length === 0) return [];

    // Garder uniquement IPE* pour l'énergie demandée
    const candidates = variables.filter(v =>
        (v.metricType === 'IPE' || v.metricType === 'IPE_kg') && 
        v.energyType === targetEnergy && 
        !!v.unit && 
        v.isActive
    );

    // Agréger par metricType → unité la plus fréquente
    const byMetric: Record<string, Record<string, number>> = {};
    for (const v of candidates) {
        if (!byMetric[v.metricType]) byMetric[v.metricType] = {};
        const u = v.unit.trim();
        byMetric[v.metricType][u] = (byMetric[v.metricType][u] || 0) + 1;
    }

    const variants: Array<{ metricType: SmartMetricType; energyType: SmartEnergyType; unit: string }> = [];
    (['IPE_kg', 'IPE'] as SmartMetricType[]).forEach(mt => {
        const freqMap = byMetric[mt];
        if (freqMap) {
            const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
            const bestUnit = sorted[0]?.[0] || '';
            if (bestUnit) variants.push({ metricType: mt, energyType: targetEnergy, unit: bestUnit });
        }
    });

    return variants;
}

/**
 * Résout l'unité IPE pour une série spécifique en se basant sur MetricType/EnergyType
 */
export function getSmartIPEUnitForSeries(
    variables: SmartVariableData[],
    seriesMetricType?: string | null,
    seriesEnergyType?: string | null,
    widgetEnergyType?: string
): string {
    
    // Normaliser
    const mt = (seriesMetricType || '').trim() as SmartMetricType;
    const et = (seriesEnergyType || '').trim() as SmartEnergyType;

    // 1) Si la série indique explicitement IPE_kg ou IPE + énergie → direct
    if (et) {
        if (mt === 'IPE_kg') {
            const u = findSmartVariableUnit(variables, 'IPE_kg', et);
            if (u) return u;
        }
        if (mt === 'IPE') {
            const u = findSmartVariableUnit(variables, 'IPE', et);
            if (u) return u;
        }
        // Sinon, tenter IPE_kg puis IPE
        const uKg = findSmartVariableUnit(variables, 'IPE_kg', et);
        if (uKg) return uKg;
        const u = findSmartVariableUnit(variables, 'IPE', et);
        if (u) return u;
    }

    // 2) Pas d'énergie fournie: utiliser l'énergie du widget s'il existe
    const widgetEt = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType || ''] || 'Elec';
    const wKg = findSmartVariableUnit(variables, 'IPE_kg', widgetEt);
    if (wKg) return wKg;
    const w = findSmartVariableUnit(variables, 'IPE', widgetEt);
    if (w) return w;

    // 3) Dernier recours: choisir la première unité IPE_kg ou IPE disponible
    const anyKg = variables.find(v => v.metricType === 'IPE_kg' && v.unit && v.isActive)?.unit;
    if (anyKg) return anyKg;
    const any = variables.find(v => v.metricType === 'IPE' && v.unit && v.isActive)?.unit;
    return any || '';
}

/**
 * Trouve l'unité de Production la plus cohérente avec une unité d'IPE donnée
 */
export function findProductionUnitForIPE(
    variables: SmartVariableData[],
    ipeUnit: string
): string {
    
    if (!variables || variables.length === 0) return '';

    const prodVars = variables.filter(v => 
        v.metricType.startsWith('Prod') && v.isActive
    );
    if (prodVars.length === 0) return '';

    const denom = (ipeUnit || '').split('/')[1]?.trim().toLowerCase();
    if (denom) {
        // Chercher la meilleure correspondance par inclusion (kg, pcs, etc.)
        const exact = prodVars.find(v => v.unit.trim().toLowerCase() === denom)?.unit;
        if (exact) return exact;
        const containing = prodVars.find(v => v.unit.toLowerCase().includes(denom))?.unit;
        if (containing) return containing;
    }

    // Sinon, renvoyer l'unité Prod la plus fréquente
    const freq: Record<string, number> = {};
    for (const v of prodVars) {
        const u = v.unit.trim();
        freq[u] = (freq[u] || 0) + 1;
    }
    const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    return best || prodVars[0]?.unit || '';
}

/**
 * Fonction helper pour obtenir l'unité d'un type selon le mode
 */
export function getSmartUnitForComparison(
    variables: SmartVariableData[], 
    widgetEnergyType: string, 
    viewMode: string
): string {
    
    const smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType] || 'Elec';
    
    if (viewMode === 'ipe') {
        // En mode IPE, prioriser IPE_kg puis IPE
        return findSmartVariableUnit(variables, 'IPE_kg', smartEnergyType) || 
               findSmartVariableUnit(variables, 'IPE', smartEnergyType);
    } else {
        // En mode énergétique, utiliser Conso
        return findSmartVariableUnit(variables, 'Conso', smartEnergyType);
    }
}

/**
 * Récupère les unités IPE pour les noms des IPE selon l'énergie sélectionnée
 */
export function getSmartIPEUnits(
    variables: SmartVariableData[],
    widgetEnergyType: string
): { ipe1Unit: string; ipe2Unit: string } {
    
    // 1) Déterminer l'énergie Smart pertinente
    let smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[widgetEnergyType];

    if (!smartEnergyType) {
        // Choisir l'énergie la plus représentée parmi les variables IPE (priorité IPE_kg)
        const candidatesKg = variables.filter(v => v.metricType === 'IPE_kg' && v.unit && v.isActive);
        const candidates = candidatesKg.length > 0 ? candidatesKg : variables.filter(v => v.metricType === 'IPE' && v.unit && v.isActive);
        const freq: Record<string, number> = {};
        for (const v of candidates) {
            freq[v.energyType] = (freq[v.energyType] || 0) + 1;
        }
        const bestEnergy = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] as SmartEnergyType | undefined;
        smartEnergyType = bestEnergy || 'Elec';
    }

    // 2) Résoudre séparément l'unité de IPE_kg et celle de IPE
    const unitKg = findSmartVariableUnit(variables, 'IPE_kg', smartEnergyType);
    const unitPcs = findSmartVariableUnit(variables, 'IPE', smartEnergyType);

    // 3) Renvoyer deux unités distinctes pour alimenter le toggle
    //    - ipe1Unit: IPE_kg si disponible (ex: kWh/kg), sinon IPE
    //    - ipe2Unit: IPE (ex: kWh/pcs) si dispo, sinon IPE_kg
    const ipe1Unit = unitKg || unitPcs || '';
    const ipe2Unit = unitPcs || unitKg || '';

    return { ipe1Unit, ipe2Unit };
}

/**
 * Valide la cohérence des unités entre variables Smart
 */
export function validateSmartUnitConsistency(
    variables: SmartVariableData[],
    requiredMetricType: SmartMetricType,
    requiredEnergyType?: SmartEnergyType
): { isConsistent: boolean; units: string[]; recommendedUnit?: string } {
    
    let filteredVariables = variables.filter(v => 
        v.metricType === requiredMetricType && v.isActive
    );
    
    if (requiredEnergyType) {
        filteredVariables = filteredVariables.filter(v => v.energyType === requiredEnergyType);
    }
    
    const units = [...new Set(filteredVariables.map(v => v.unit))];
    
    if (units.length <= 1) {
        return {
            isConsistent: true,
            units,
            recommendedUnit: units[0]
        };
    }
    
    // Trouver l'unité la plus fréquente
    const unitCounts: Record<string, number> = {};
    filteredVariables.forEach(v => {
        unitCounts[v.unit] = (unitCounts[v.unit] || 0) + 1;
    });
    
    const recommendedUnit = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
        isConsistent: false,
        units,
        recommendedUnit
    };
}

/**
 * Debug des variables Smart pour le développement
 */
export function debugSmartVariables(variables: SmartVariableData[]): object {
    
    if (process.env.NODE_ENV !== "development") return {};
    
    const byMetric: Record<string, SmartVariableData[]> = {};
    const byEnergy: Record<string, SmartVariableData[]> = {};
    
    for (const v of variables) {
        if (!byMetric[v.metricType]) byMetric[v.metricType] = [];
        if (!byEnergy[v.energyType]) byEnergy[v.energyType] = [];
        byMetric[v.metricType].push(v);
        byEnergy[v.energyType].push(v);
    }
    
    return {
        total: variables.length,
        active: variables.filter(v => v.isActive).length,
        byMetricType: byMetric,
        byEnergyType: byEnergy,
        uniqueUnits: [...new Set(variables.map(v => v.unit))].sort()
    };
}