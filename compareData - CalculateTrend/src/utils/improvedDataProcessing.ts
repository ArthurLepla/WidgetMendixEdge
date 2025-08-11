// src/utils/improvedDataProcessing.ts
import Big from "big.js";
import { ListValue, ListAttributeValue, ValueStatus } from "mendix";
import { 
    filterValidIPEAssets, 
    extractSmartVariablesForValidation,
    type AssetData,
    type IPEValidationSummary 
} from "./ipeValidation";

// Types pour le traitement des données
export interface ProcessingOptions {
    selectedAssetNames: string[];
    viewMode: "energetic" | "ipe";
    energyType: string;
    maxDataPointsPerAsset?: number;
    enableStrictValidation?: boolean;
    debugMode?: boolean;
}

export interface ProcessingResult {
    validAssets: AssetData[];
    invalidAssets: AssetData[];
    validationSummary?: IPEValidationSummary;
    warnings: string[];
    totalDataPoints: number;
    samplingApplied: boolean;
    processingTime: number;
}

// Constantes pour les types de métriques
const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE", 
    IPE_KG: "IPE_kg",
    PROD: "Prod",
    PROD_KG: "Prod_kg"
} as const;

/**
 * Traite les données avec validation et filtrage intelligent
 */
export function processDataWithValidation(
    timeSeriesDataSource: ListValue | undefined,
    timestampAttr: ListAttributeValue<Date> | undefined,
    valueAttr: ListAttributeValue<Big> | undefined,
    assetNameAttr: ListAttributeValue<string> | undefined,
    metricTypeAttr: ListAttributeValue<string> | undefined,
    energyTypeAttr: ListAttributeValue<string> | undefined,
    // Variables Smart pour validation IPE
    assetVariablesDataSource: ListValue | undefined,
    variableNameAttr: ListAttributeValue<string> | undefined,
    variableUnitAttr: ListAttributeValue<string> | undefined,
    variableMetricTypeAttr: ListAttributeValue<string> | undefined,
    variableEnergyTypeAttr: ListAttributeValue<string> | undefined,
    options: ProcessingOptions
): ProcessingResult {
    
    const startTime = performance.now();
    const result: ProcessingResult = {
        validAssets: [],
        invalidAssets: [],
        warnings: [],
        totalDataPoints: 0,
        samplingApplied: false,
        processingTime: 0
    };

    // Vérifications préliminaires
    if (!timeSeriesDataSource || !timestampAttr || !valueAttr || !assetNameAttr) {
        result.warnings.push("Données temporelles incomplètes");
        result.processingTime = performance.now() - startTime;
        return result;
    }

    if (timeSeriesDataSource.status !== ValueStatus.Available) {
        result.warnings.push("Données temporelles non disponibles");
        result.processingTime = performance.now() - startTime;
        return result;
    }

    try {
        // 1. Extraction des variables Smart pour validation IPE
        const smartVariables = extractSmartVariablesForValidation(
            assetVariablesDataSource,
            variableNameAttr,
            variableUnitAttr,
            variableMetricTypeAttr,
            variableEnergyTypeAttr
        );

        // 2. Grouper les données par asset avec filtrage
        const dataByAsset = new Map<string, { 
            timestamps: Date[]; 
            values: Big[]; 
            metricType?: string; 
            energyType?: string;
            dataPoints: number;
        }>();
        
        // Set pour détecter les doublons asset/timestamp
        const processedKeys = new Set<string>();
        
        let totalProcessedPoints = 0;
        
        timeSeriesDataSource.items?.forEach(item => {
            const assetName = assetNameAttr.get(item)?.value;
            const timestamp = timestampAttr.get(item)?.value;
            const value = valueAttr.get(item)?.value;
            const metricType = metricTypeAttr?.get(item)?.value;
            const energyType = energyTypeAttr?.get(item)?.value;

            if (!assetName || !timestamp || !value) return;

            // Filtrer par assets sélectionnés si spécifié
            if (options.selectedAssetNames.length > 0 && !options.selectedAssetNames.includes(assetName)) {
                return;
            }

            // Filtrage par type de métrique selon le mode
            if (options.viewMode === "ipe") {
                if (metricType !== METRIC_TYPES.IPE && metricType !== METRIC_TYPES.IPE_KG) {
                    if (options.debugMode) {
                        console.log(`🔍 Filtrage IPE: Exclu ${assetName} (type: ${metricType}, énergie: ${energyType})`);
                    }
                    return; // Exclure les données non-IPE en mode IPE
                }
            } else {
                if (metricType === METRIC_TYPES.IPE || metricType === METRIC_TYPES.IPE_KG) {
                    if (options.debugMode) {
                        console.log(`🔍 Filtrage Énergétique: Exclu ${assetName} (type: ${metricType}, énergie: ${energyType})`);
                    }
                    return; // Exclure les données IPE en mode énergétique
                }
            }

            // 🔧 FILTRAGE DES DOUBLONS : Garder seulement la première occurrence par asset/timestamp
            const assetTimestampKey = `${assetName}_${timestamp.toISOString()}`;
            if (processedKeys.has(assetTimestampKey)) {
                return; // Ignorer les doublons
            }
            processedKeys.add(assetTimestampKey);

            // Filtrage par type d'énergie si spécifié
            if (options.energyType && energyType && energyType !== options.energyType) {
                return;
            }

            if (!dataByAsset.has(assetName)) {
                dataByAsset.set(assetName, {
                    timestamps: [],
                    values: [],
                    metricType,
                    energyType,
                    dataPoints: 0
                });
            }

            const assetData = dataByAsset.get(assetName)!;
            assetData.timestamps.push(timestamp);
            assetData.values.push(value);
            assetData.dataPoints++;
            totalProcessedPoints++;
        });

        // 3. Convertir en format AssetData et trier par timestamp
        const processedAssets: AssetData[] = Array.from(dataByAsset.entries()).map(([name, data]) => {
            // Créer des indices de tri basés sur les timestamps
            const sortedIndices = data.timestamps
                .map((timestamp, index) => ({ timestamp, index }))
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                .map(item => item.index);

            // Réorganiser les données selon l'ordre trié
            const sortedTimestamps = sortedIndices.map(i => data.timestamps[i]);
            const sortedValues = sortedIndices.map(i => data.values[i]);

            return {
                name,
                timestamps: sortedTimestamps,
                values: sortedValues,
                metricType: data.metricType,
                energyType: data.energyType
            };
        });

        // 4. Validation IPE si nécessaire
        if (options.viewMode === "ipe" && options.enableStrictValidation) {
            const { validAssets, validationSummary } = filterValidIPEAssets(processedAssets, smartVariables);
            
            result.validAssets = validAssets;
            result.invalidAssets = processedAssets.filter(asset => 
                !validationSummary.validAssets.includes(asset.name)
            );
            result.validationSummary = validationSummary;
            result.warnings.push(...validationSummary.warnings);

            // Logs de debug
            if (options.debugMode) {
                console.log("🔍 IPE Validation Debug:", {
                    totalAssets: processedAssets.length,
                    validAssets: validAssets.length,
                    invalidAssets: result.invalidAssets.length,
                    warnings: validationSummary.warnings
                });
            }
        } else {
            result.validAssets = processedAssets;
        }

        // 5. Échantillonnage si nécessaire
        const maxPoints = options.maxDataPointsPerAsset || 1000;
        let samplingApplied = false;

        result.validAssets = result.validAssets.map(asset => {
            if (asset.timestamps.length > maxPoints) {
                const sampled = applySampling(asset, maxPoints);
                samplingApplied = true;
                return sampled;
            }
            return asset;
        });

        result.samplingApplied = samplingApplied;
        result.totalDataPoints = result.validAssets.reduce((sum, asset) => sum + asset.timestamps.length, 0);

        // 6. Logs de debug
        if (options.debugMode) {
            console.log("🔍 Data Processing Debug:", {
                viewMode: options.viewMode,
                energyType: options.energyType,
                selectedAssets: options.selectedAssetNames,
                totalProcessedPoints,
                validAssetsCount: result.validAssets.length,
                totalDataPoints: result.totalDataPoints,
                samplingApplied,
                processingTime: performance.now() - startTime
            });

            // 🔍 Diagnostic des données filtrées
            if (result.validAssets.length === 0 && totalProcessedPoints === 0) {
                console.warn("🚨 DIAGNOSTIC: Aucune donnée valide trouvée");
                console.warn("   - Mode demandé:", options.viewMode);
                console.warn("   - Énergie demandée:", options.energyType);
                console.warn("   - Assets sélectionnés:", options.selectedAssetNames);
                console.warn("   - Recommandation: Vérifiez le XPath de timeSeriesDataSource");
                console.warn("   - XPath suggéré pour IPE Électrique:");
                console.warn("     //TimeSeriesPoint[metricType = 'IPE' and energyType = 'Elec']");
            }
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur de traitement des données";
        result.warnings.push(`Erreur: ${errorMessage}`);
        
        if (options.debugMode) {
            console.error("❌ Data Processing Error:", err);
        }
    }

    result.processingTime = performance.now() - startTime;
    return result;
}

/**
 * Applique l'échantillonnage LTTB (Largest Triangle Three Buckets) pour réduire les points
 */
export function applySampling(asset: AssetData, maxPoints: number): AssetData {
    if (asset.timestamps.length <= maxPoints) {
        return asset;
    }

    // Algorithme LTTB simplifié pour la performance
    const step = asset.timestamps.length / maxPoints;
    const sampledIndices: number[] = [];
    
    // Toujours inclure le premier point
    sampledIndices.push(0);
    
    // Échantillonner les points intermédiaires
    for (let i = 1; i < maxPoints - 1; i++) {
        const index = Math.round(i * step);
        sampledIndices.push(Math.min(index, asset.timestamps.length - 1));
    }
    
    // Toujours inclure le dernier point
    sampledIndices.push(asset.timestamps.length - 1);
    
    // Supprimer les doublons et trier
    const uniqueIndices = [...new Set(sampledIndices)].sort((a, b) => a - b);
    
    return {
        name: asset.name,
        timestamps: uniqueIndices.map(i => asset.timestamps[i]),
        values: uniqueIndices.map(i => asset.values[i]),
        metricType: asset.metricType,
        energyType: asset.energyType
    };
}

/**
 * Valide la cohérence des unités entre assets
 */
export function validateUnitConsistency(assets: AssetData[]): {
    isConsistent: boolean;
    units: string[];
    recommendedUnit?: string;
    warnings: string[];
} {
    const result = {
        isConsistent: true,
        units: [] as string[],
        recommendedUnit: undefined as string | undefined,
        warnings: [] as string[]
    };

    // Extraire les unités depuis les métadonnées (si disponibles)
    const units = assets
        .map(asset => asset.metricType || asset.energyType)
        .filter((unit): unit is string => unit !== undefined && unit.length > 0);

    if (units.length === 0) {
        result.warnings.push("Aucune information d'unité disponible");
        return result;
    }

    const uniqueUnits = [...new Set(units)];
    result.units = uniqueUnits;

    if (uniqueUnits.length > 1) {
        result.isConsistent = false;
        result.warnings.push(`Unités incohérentes détectées: ${uniqueUnits.join(", ")}`);
        
        // Recommander l'unité la plus fréquente
        const unitCounts: Record<string, number> = {};
        units.forEach(unit => {
            unitCounts[unit] = (unitCounts[unit] || 0) + 1;
        });
        
        result.recommendedUnit = Object.entries(unitCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0];
    } else {
        result.recommendedUnit = uniqueUnits[0];
    }

    return result;
}