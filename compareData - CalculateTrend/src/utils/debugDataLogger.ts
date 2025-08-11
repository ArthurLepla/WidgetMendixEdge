// src/utils/debugDataLogger.ts
import Big from "big.js";
import { ListValue, ListAttributeValue, ValueStatus } from "mendix";

// Types pour le logging détaillé
export interface DataLogEntry {
    timestamp: string;
    assetName: string;
    value: string;
    metricType?: string;
    energyType?: string;
    variableName?: string;
    unit?: string;
    source: 'timeseries' | 'aggregated';
    index: number;
}

export interface DataAnalysisResult {
    totalItems: number;
    uniqueAssets: string[];
    uniqueTimestamps: Date[];
    duplicateTimestamps: Array<{
        timestamp: Date;
        count: number;
        entries: DataLogEntry[];
    }>;
    metricTypeDistribution: Record<string, number>;
    energyTypeDistribution: Record<string, number>;
    assetDataPoints: Record<string, number>;
    timeRange: {
        start: Date | null;
        end: Date | null;
    };
    warnings: string[];
    recommendations: string[];
}

/**
 * Log ultra-détaillé des données reçues pour diagnostic
 */
export function logDetailedDataAnalysis(
    timeSeriesDataSource: ListValue | undefined,
    timestampAttr: ListAttributeValue<Date> | undefined,
    valueAttr: ListAttributeValue<Big> | undefined,
    assetNameAttr: ListAttributeValue<string> | undefined,
    metricTypeAttr: ListAttributeValue<string> | undefined,
    energyTypeAttr: ListAttributeValue<string> | undefined,
    variableNameAttr?: ListAttributeValue<string> | undefined,
    unitAttr?: ListAttributeValue<string> | undefined
): DataAnalysisResult {
    
    const result: DataAnalysisResult = {
        totalItems: 0,
        uniqueAssets: [],
        uniqueTimestamps: [],
        duplicateTimestamps: [],
        metricTypeDistribution: {},
        energyTypeDistribution: {},
        assetDataPoints: {},
        timeRange: { start: null, end: null },
        warnings: [],
        recommendations: []
    };

    if (!timeSeriesDataSource || timeSeriesDataSource.status !== ValueStatus.Available) {
        result.warnings.push("❌ DataSource non disponible ou non chargée");
        return result;
    }

    if (!timestampAttr || !valueAttr || !assetNameAttr) {
        result.warnings.push("❌ Attributs requis manquants");
        return result;
    }

    const items = timeSeriesDataSource.items || [];
    result.totalItems = items.length;

    console.group("🔍 ANALYSE DÉTAILLÉE DES DONNÉES");
    console.log("📊 Informations générales:", {
        totalItems: result.totalItems,
        dataSourceStatus: timeSeriesDataSource.status,
        hasMetricType: !!metricTypeAttr,
        hasEnergyType: !!energyTypeAttr,
        hasVariableName: !!variableNameAttr,
        hasUnit: !!unitAttr
    });

    // Collecter toutes les entrées avec leurs métadonnées
    const allEntries: DataLogEntry[] = [];
    const timestampMap = new Map<string, DataLogEntry[]>();
    const assetMap = new Set<string>();

    items.forEach((item, index) => {
        const timestamp = timestampAttr.get(item)?.value;
        const value = valueAttr.get(item)?.value;
        const assetName = assetNameAttr.get(item)?.value;
        const metricType = metricTypeAttr?.get(item)?.value;
        const energyType = energyTypeAttr?.get(item)?.value;
        const variableName = variableNameAttr?.get(item)?.value;
        const unit = unitAttr?.get(item)?.value;

        if (!timestamp || !value || !assetName) {
            result.warnings.push(`⚠️ Données incomplètes à l'index ${index}: timestamp=${!!timestamp}, value=${!!value}, assetName=${!!assetName}`);
            return;
        }

        const entry: DataLogEntry = {
            timestamp: timestamp.toISOString(),
            assetName,
            value: value.toString(),
            metricType,
            energyType,
            variableName,
            unit,
            source: 'timeseries',
            index
        };

        allEntries.push(entry);
        assetMap.add(assetName);

        // Grouper par timestamp pour détecter les doublons
        const timestampKey = timestamp.toISOString();
        if (!timestampMap.has(timestampKey)) {
            timestampMap.set(timestampKey, []);
        }
        timestampMap.get(timestampKey)!.push(entry);

        // Statistiques par type
        if (metricType) {
            result.metricTypeDistribution[metricType] = (result.metricTypeDistribution[metricType] || 0) + 1;
        }
        if (energyType) {
            result.energyTypeDistribution[energyType] = (result.energyTypeDistribution[energyType] || 0) + 1;
        }

        // Points de données par asset
        result.assetDataPoints[assetName] = (result.assetDataPoints[assetName] || 0) + 1;

        // Plage temporelle
        if (!result.timeRange.start || timestamp < result.timeRange.start) {
            result.timeRange.start = timestamp;
        }
        if (!result.timeRange.end || timestamp > result.timeRange.end) {
            result.timeRange.end = timestamp;
        }
    });

    result.uniqueAssets = Array.from(assetMap);
    result.uniqueTimestamps = Array.from(timestampMap.keys()).map(ts => new Date(ts));

    // Détecter les timestamps en double
    timestampMap.forEach((entries, timestampKey) => {
        if (entries.length > 1) {
            const timestamp = new Date(timestampKey);
            result.duplicateTimestamps.push({
                timestamp,
                count: entries.length,
                entries
            });
        }
    });

    // Logs détaillés
    console.log("📈 Distribution par type de métrique:", result.metricTypeDistribution);
    console.log("⚡ Distribution par type d'énergie:", result.energyTypeDistribution);
    console.log("🏭 Points de données par asset:", result.assetDataPoints);
    console.log("⏰ Plage temporelle:", {
        start: result.timeRange.start?.toISOString(),
        end: result.timeRange.end?.toISOString(),
        duration: result.timeRange.start && result.timeRange.end 
            ? `${Math.round((result.timeRange.end.getTime() - result.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} jours`
            : 'N/A'
    });

    // Analyser les doublons
    if (result.duplicateTimestamps.length > 0) {
        console.warn("🚨 TIMESTAMPS EN DOUBLE DÉTECTÉS:", result.duplicateTimestamps.length);
        
        result.duplicateTimestamps.forEach((duplicate, index) => {
            console.group(`🔍 Doublon ${index + 1}: ${duplicate.timestamp.toISOString()} (${duplicate.count} entrées)`);
            
            duplicate.entries.forEach((entry, entryIndex) => {
                console.log(`  ${entryIndex + 1}. Asset: ${entry.assetName}, Valeur: ${entry.value}, Type: ${entry.metricType || 'N/A'}, Énergie: ${entry.energyType || 'N/A'}`);
            });
            
            // Analyser les différences
            const uniqueAssets = [...new Set(duplicate.entries.map(e => e.assetName))];
            const uniqueValues = [...new Set(duplicate.entries.map(e => e.value))];
            const uniqueMetricTypes = [...new Set(duplicate.entries.map(e => e.metricType).filter(Boolean))];
            
            if (uniqueAssets.length === 1) {
                console.warn(`    ⚠️ Même asset (${uniqueAssets[0]}) avec ${uniqueValues.length} valeurs différentes`);
                if (uniqueValues.length > 1) {
                    result.warnings.push(`Asset ${uniqueAssets[0]} a ${uniqueValues.length} valeurs différentes au même timestamp`);
                }
            }
            
            if (uniqueMetricTypes.length > 1) {
                console.warn(`    ⚠️ Types de métriques différents: ${uniqueMetricTypes.join(', ')}`);
                result.warnings.push(`Types de métriques mixtes au timestamp ${duplicate.timestamp.toISOString()}`);
            }
            
            console.groupEnd();
        });
        
        result.recommendations.push("🔧 Appliquer un filtrage par MetricType pour éviter les doublons");
        result.recommendations.push("🔧 Vérifier la cohérence des données par asset");
    }

    // Recommandations générales
    if (Object.keys(result.metricTypeDistribution).length > 2) {
        result.recommendations.push("🔧 Considérer un filtrage par MetricType pour améliorer la performance");
    }

    if (result.uniqueAssets.length > 5) {
        result.recommendations.push("🔧 Limiter le nombre d'assets pour améliorer les performances");
    }

    console.log("📋 Résumé des warnings:", result.warnings);
    console.log("💡 Recommandations:", result.recommendations);
    console.groupEnd();

    return result;
}

/**
 * Log spécifique pour le mode IPE
 */
export function logIPEDataAnalysis(
    analysisResult: DataAnalysisResult,
    selectedAssetNames: string[]
): void {
    
    console.group("🔍 ANALYSE SPÉCIFIQUE MODE IPE");
    
    const ipeEntries = analysisResult.duplicateTimestamps.flatMap(d => 
        d.entries.filter(e => e.metricType === 'IPE' || e.metricType === 'IPE_kg')
    );
    
    console.log("📊 Données IPE trouvées:", {
        totalIPE: ipeEntries.length,
        ipeByAsset: ipeEntries.reduce((acc, entry) => {
            acc[entry.assetName] = (acc[entry.assetName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        selectedAssets: selectedAssetNames,
        hasSelectedAssets: selectedAssetNames.length > 0
    });

    // Vérifier la cohérence des assets sélectionnés
    if (selectedAssetNames.length > 0) {
        const availableAssets = Object.keys(analysisResult.assetDataPoints);
        const missingAssets = selectedAssetNames.filter(asset => !availableAssets.includes(asset));
        
        if (missingAssets.length > 0) {
            console.warn("⚠️ Assets sélectionnés non trouvés dans les données:", missingAssets);
        }
    }

    console.groupEnd();
}

/**
 * Log des données après filtrage
 */
export function logFilteredDataAnalysis(
    originalAnalysis: DataAnalysisResult,
    filteredAssets: Array<{ name: string; timestamps: Date[]; values: Big[] }>,
    filterCriteria: {
        selectedAssetNames: string[];
        viewMode: "energetic" | "ipe";
        energyType?: string;
    }
): void {
    
    console.group("🔍 ANALYSE DES DONNÉES APRÈS FILTRAGE");
    
    console.log("🎯 Critères de filtrage:", filterCriteria);
    console.log("📊 Résultats du filtrage:", {
        assetsAvant: originalAnalysis.uniqueAssets.length,
        assetsApres: filteredAssets.length,
        totalPointsAvant: originalAnalysis.totalItems,
        totalPointsApres: filteredAssets.reduce((sum, asset) => sum + asset.timestamps.length, 0)
    });

    // Vérifier les doublons après filtrage
    const filteredTimestamps = new Map<string, Array<{ asset: string; value: string; timestamp: Date }>>();
    
    filteredAssets.forEach(asset => {
        asset.timestamps.forEach((timestamp, index) => {
            const timestampKey = timestamp.toISOString();
            if (!filteredTimestamps.has(timestampKey)) {
                filteredTimestamps.set(timestampKey, []);
            }
            filteredTimestamps.get(timestampKey)!.push({
                asset: asset.name,
                value: asset.values[index].toString(),
                timestamp
            });
        });
    });

    const remainingDuplicates = Array.from(filteredTimestamps.entries())
        .filter(([_, entries]) => entries.length > 1);

    if (remainingDuplicates.length > 0) {
        console.warn("🚨 DOUBLONS RESTANTS APRÈS FILTRAGE:", remainingDuplicates.length);
        remainingDuplicates.forEach(([timestamp, entries]) => {
            console.log(`  ${timestamp}: ${entries.map(e => `${e.asset}=${e.value}`).join(', ')}`);
        });
    } else {
        console.log("✅ Aucun doublon restant après filtrage");
    }

    console.groupEnd();
}
