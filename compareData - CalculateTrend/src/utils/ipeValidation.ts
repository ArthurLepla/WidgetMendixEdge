// src/utils/ipeValidation.ts
import { ListValue, ListAttributeValue, ValueStatus } from "mendix";
import Big from "big.js";

// Types pour la validation IPE
export interface IPEValidationResult {
    isValid: boolean;
    reason?: string;
    hasIPEVariable: boolean;
    hasIPEData: boolean;
    metricTypes: string[];
    energyTypes: string[];
}

export interface IPEValidationSummary {
    validAssets: string[];
    invalidAssets: string[];
    warnings: string[];
    totalAssets: number;
    validCount: number;
    invalidCount: number;
}

export interface AssetData {
    name: string;
    timestamps: Date[];
    values: Big[];
    metricType?: string;
    energyType?: string;
}

// Constantes pour les types de métriques IPE
const IPE_METRIC_TYPES = ['IPE', 'IPE_kg'] as const;
const VALID_ENERGY_TYPES = ['Elec', 'Gaz', 'Eau', 'Air', 'electricity', 'gas', 'water', 'air'] as const;

/**
 * Valide si un asset est compatible avec le mode IPE
 */
export function validateAssetForIPE(
    _assetName: string, // Préfixé avec _ pour indiquer qu'il n'est pas utilisé
    assetData: AssetData,
    smartVariables: Array<{ name: string; metricType: string; energyType: string; unit: string }>
): IPEValidationResult {
    
    const result: IPEValidationResult = {
        isValid: false,
        hasIPEVariable: false,
        hasIPEData: false,
        metricTypes: [],
        energyTypes: []
    };

    // 1. Vérifier si l'asset a des variables IPE définies
    const assetIPEVariables = smartVariables.filter(v => 
        v.metricType === 'IPE' || v.metricType === 'IPE_kg'
    );
    result.hasIPEVariable = assetIPEVariables.length > 0;

    // 2. Vérifier si l'asset a des données IPE dans les séries temporelles
    const hasIPEMetricType = assetData.metricType ? IPE_METRIC_TYPES.includes(assetData.metricType as any) : false;
    result.hasIPEData = hasIPEMetricType;
    result.metricTypes = assetData.metricType ? [assetData.metricType] : [];
    result.energyTypes = assetData.energyType ? [assetData.energyType] : [];

    // 3. Logique de validation
    if (!result.hasIPEVariable && !result.hasIPEData) {
        result.reason = "Asset sans variable IPE ni données IPE";
        return result;
    }

    if (!result.hasIPEVariable) {
        result.reason = "Asset avec données IPE mais sans variable IPE définie";
        return result;
    }

    if (!result.hasIPEData) {
        result.reason = "Asset avec variable IPE mais sans données IPE dans les séries";
        return result;
    }

    // 4. Validation de cohérence énergie
    if (assetData.energyType && !VALID_ENERGY_TYPES.includes(assetData.energyType as any)) {
        result.reason = `Type d'énergie non supporté: ${assetData.energyType}`;
        return result;
    }

    // Asset valide pour le mode IPE
    result.isValid = true;
    return result;
}

/**
 * Valide tous les assets pour le mode IPE
 */
export function validateAllAssetsForIPE(
    assetsData: AssetData[],
    smartVariables: Array<{ name: string; metricType: string; energyType: string; unit: string }>
): IPEValidationSummary {
    
    const summary: IPEValidationSummary = {
        validAssets: [],
        invalidAssets: [],
        warnings: [],
        totalAssets: assetsData.length,
        validCount: 0,
        invalidCount: 0
    };

    // Valider chaque asset
    for (const assetData of assetsData) {
        const validation = validateAssetForIPE(assetData.name, assetData, smartVariables);
        
        if (validation.isValid) {
            summary.validAssets.push(assetData.name);
            summary.validCount++;
        } else {
            summary.invalidAssets.push(assetData.name);
            summary.invalidCount++;
            
            // Ajouter un avertissement détaillé
            summary.warnings.push(
                `Asset "${assetData.name}" exclu du mode IPE: ${validation.reason}`
            );
        }
    }

    // Avertissement global si trop d'assets invalides
    if (summary.invalidCount > 0 && summary.validCount === 0) {
        summary.warnings.unshift(
            "⚠️ Aucun asset valide pour le mode IPE. Vérifiez que les assets ont des variables IPE définies."
        );
    } else if (summary.invalidCount > summary.validCount) {
        summary.warnings.unshift(
            `⚠️ Plus d'assets invalides (${summary.invalidCount}) que valides (${summary.validCount}) pour le mode IPE.`
        );
    }

    return summary;
}

/**
 * Filtre les assets valides pour le mode IPE
 */
export function filterValidIPEAssets(
    assetsData: AssetData[],
    smartVariables: Array<{ name: string; metricType: string; energyType: string; unit: string }>
): { validAssets: AssetData[]; validationSummary: IPEValidationSummary } {
    
    const validationSummary = validateAllAssetsForIPE(assetsData, smartVariables);
    
    const validAssets = assetsData.filter(asset => 
        validationSummary.validAssets.includes(asset.name)
    );

    return {
        validAssets,
        validationSummary
    };
}

/**
 * Extrait les variables Smart depuis les DataSources Mendix
 * (Adapté depuis smartUnitUtils.ts pour la validation)
 */
export function extractSmartVariablesForValidation(
    assetVariablesDataSource: ListValue | undefined,
    variableNameAttr: ListAttributeValue<string> | undefined,
    variableUnitAttr: ListAttributeValue<string> | undefined,
    variableMetricTypeAttr: ListAttributeValue<string> | undefined,
    variableEnergyTypeAttr: ListAttributeValue<string> | undefined
): Array<{ name: string; metricType: string; energyType: string; unit: string }> {
    
    if (assetVariablesDataSource?.status !== ValueStatus.Available || 
        !variableNameAttr || !variableUnitAttr || !variableMetricTypeAttr) {
        return [];
    }

    const variables: Array<{ name: string; metricType: string; energyType: string; unit: string }> = [];

    assetVariablesDataSource.items?.forEach(item => {
        const name = variableNameAttr.get(item)?.value;
        const unit = variableUnitAttr.get(item)?.value;
        const metricType = variableMetricTypeAttr.get(item)?.value;
        const energyType = variableEnergyTypeAttr?.get(item)?.value || 'None';

        if (name && unit && metricType) {
            variables.push({
                name,
                unit,
                metricType,
                energyType
            });
        }
    });

    return variables;
}