import { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import Big from "big.js";
import { ValueStatus } from "mendix";
import { Inbox } from "lucide-react";

import { CompareDataContainerProps } from "../typings/CompareDataProps";
import { ChartContainer } from "./components/ChartContainer/ChartContainer";
import { useDoubleIPEToggle, useGranulariteManuelleToggle } from "./hooks/use-feature-toggle";
import { energyConfigs } from "./utils/energy";
import { 
    extractSmartVariablesData, 
    getSmartIPEUnits, 
    getIPEVariantsFromVariables,
    getSmartIPEUnitForSeries,
    debugSmartVariables,
    WIDGET_TO_SMART_ENERGY_MAPPING,
    type SmartVariableData,
    type SmartEnergyType
} from "./utils/smartUnitUtils";
import { 
    processDataWithValidation,
    type ProcessingResult
} from "./utils/improvedDataProcessing";
import { 
    logDetailedDataAnalysis,
    logIPEDataAnalysis,
    logFilteredDataAnalysis,
    type DataAnalysisResult
} from "./utils/debugDataLogger";
import { IPEUnavailable } from "./components/IPEUnavailable";
import { ConsumptionUnavailable } from "./components/ConsumptionUnavailable";

// Système de debug simple
const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`[CompareData] ${message}`, data || "");
    }
};

import "./ui/CompareData.css";

// Types pour les données de comparaison - exportés pour utilisation dans d'autres composants
export interface AssetData {
    name: string;
    timestamps: Date[];
    values: Big[];
    metricType?: string;
    energyType?: string;
}

export interface AssetStats {
    name: string;
    currentValue: Big;
    maxValue: Big;
    minValue: Big;
    avgValue: Big;
    sumValue: Big;
    totalConsommationIPE?: Big;
    totalProduction?: Big;
    ipeValue?: Big;
}

// Constantes pour les types de métriques
const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE", 
    IPE_KG: "IPE_kg",
    PROD: "Prod",
    PROD_KG: "Prod_kg"
} as const;

// Composant pour afficher le message d'absence de données
const NoDataMessage = () => (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 tw-text-center tw-min-h-[200px]">
        <Inbox className="tw-h-16 tw-w-16 tw-text-gray-400 tw-mb-4" />
        <div className="tw-text-gray-500 tw-text-xl tw-mb-2">
            Aucune donnée disponible
        </div>
        <div className="tw-text-gray-400 tw-text-base">
            Aucune donnée n'a pu être récupérée pour la période sélectionnée
        </div>
    </div>
);

export function CompareData(props: CompareDataContainerProps): ReactElement {
    const {
        devMode,
        viewModeConfig,
        selectedAsset,
        dateRange,
        timeSeriesDataSource,
        timestampAttr,
        valueAttr,
        assetNameAttr,
        metricTypeAttr,
        energyTypeAttr,
        // Smart variables (optionnels)
        assetVariablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr,
        displayModeAttr,
        displayTimeAttr,
        displayUnitAttr,
        displayPreviewOKAttr,
        bufferModeAttr,
        bufferTimeAttr,
        bufferUnitAttr,
        onModeChange,
        onTimeChange,
        featureList,
        featureNameAttr,
        onAddProductionClick
    } = props;

    // États pour les données
    const [assetsData, setAssetsData] = useState<AssetData[]>([]);
    const [assetsStats, setAssetsStats] = useState<AssetStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [smartVariables, setSmartVariables] = useState<SmartVariableData[]>([]);
    const [processingWarnings, setProcessingWarnings] = useState<string[]>([]);
    const [dataAnalysis, setDataAnalysis] = useState<DataAnalysisResult | null>(null);
    const [ipeUnavailable, setIpeUnavailable] = useState<{
        show: boolean;
        ipeCount: number;
        fallbackReason: string;
        recommendedMode: "double" | "single" | "fallback";
        availableAssets: string[];
    } | null>(null);

    // Feature toggles
    const isDoubleIPEEnabled = useDoubleIPEToggle(featureList, featureNameAttr);
    const isGranulariteManuelleEnabled = useGranulariteManuelleToggle(featureList, featureNameAttr);

    // Parse des assets sélectionnés
    const selectedAssetNames = useMemo(() => {
        const namesValue = selectedAsset?.[0]?.selectedAssetName?.value;
        if (!namesValue) return [];
        return namesValue
            .split(",")
            .map((name: string) => name.trim())
            .filter((name: string) => name.length > 0);
    }, [selectedAsset?.[0]?.selectedAssetName?.value]);

    // Mode via configuration (prioritaire) sinon auto-détection
    const detectedMode = useMemo(() => {
        if (viewModeConfig === "energetic" || viewModeConfig === "ipe") {
            return viewModeConfig;
        }
        if (!timeSeriesDataSource?.items?.length || !metricTypeAttr) return "energetic";
        const firstItems = timeSeriesDataSource.items.slice(0, 10);
        const metricTypes = firstItems
            .map(item => metricTypeAttr.get(item)?.value || "")
            .filter(type => type.length > 0);
        const hasIPE = metricTypes.some(type => type === METRIC_TYPES.IPE || type === METRIC_TYPES.IPE_KG);
        debug("Mode detection", { metricTypes, hasIPE });
        return hasIPE ? "ipe" : "energetic";
    }, [timeSeriesDataSource?.items, metricTypeAttr, viewModeConfig]);

    // Auto-détection du type d'énergie
    const detectedEnergyType = useMemo(() => {
        if (!timeSeriesDataSource?.items?.length || !energyTypeAttr) return "Elec";
        
        const firstItems = timeSeriesDataSource.items.slice(0, 10);
        const energyTypes = firstItems
            .map(item => energyTypeAttr.get(item)?.value || "")
            .filter(type => type.length > 0);
        
        return energyTypes[0] || "Elec";
    }, [timeSeriesDataSource?.items, energyTypeAttr]);

    // Chargement et extraction des variables Smart de l'asset
    useEffect(() => {
        const variables = extractSmartVariablesData(
            assetVariablesDataSource,
            variableNameAttr,
            variableUnitAttr,
            variableMetricTypeAttr,
            variableEnergyTypeAttr
        );
        
        setSmartVariables(variables);
        
        // Debug complet des variables Smart
        const debugInfo = debugSmartVariables(variables);
        debug("Smart Variables loaded", debugInfo);
        
    }, [
        assetVariablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr
    ]);

    // Résolution intelligente des unités IPE basée sur les métadonnées de série
    const smartIPEUnits = useMemo(() => {
        if (detectedMode !== "ipe") return { ipe1Unit: "", ipe2Unit: "" };

        // Conversion du type d'énergie widget vers enum Smart
        const smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[detectedEnergyType] || 'Elec';
        
        // Récupération des métadonnées de série si disponibles
        const firstItem = timeSeriesDataSource?.items && timeSeriesDataSource.items.length > 0
            ? timeSeriesDataSource.items[0]
            : undefined;

        const seriesMetricType = firstItem && metricTypeAttr ? metricTypeAttr.get(firstItem)?.value : null;
        const seriesEnergyType = firstItem && energyTypeAttr ? energyTypeAttr.get(firstItem)?.value : null;

        // Résolution des unités IPE avec priorité aux métadonnées de série
        const seriesIPE1Unit = getSmartIPEUnitForSeries(
            smartVariables,
            seriesMetricType,
            seriesEnergyType,
            detectedEnergyType
        );

        // Variantes disponibles depuis les variables de l'asset
        const variants = getIPEVariantsFromVariables(smartVariables, smartEnergyType as SmartEnergyType);
        const baseIpeKgUnit = variants.find(v => v.metricType === 'IPE_kg')?.unit;
        const baseIpeUnit = variants.find(v => v.metricType === 'IPE')?.unit;

        // Fallback général
        const fallbackIPE = getSmartIPEUnits(smartVariables, detectedEnergyType);

        // Logique de résolution intelligente selon la feature Double IPE
        const hasSeriesExplicit = (seriesMetricType || '').trim() === 'IPE' || (seriesMetricType || '').trim() === 'IPE_kg';

        let ipe1Unit = '';
        let ipe2Unit = '';

        if (isDoubleIPEEnabled) {
            // Mode Double IPE activé : afficher les deux variantes
            if (!hasSeriesExplicit) {
                // Cas le plus fréquent: la série ne précise pas le MetricType → priorité aux variantes détectées
                ipe1Unit = baseIpeKgUnit || seriesIPE1Unit || fallbackIPE.ipe1Unit;
                ipe2Unit = baseIpeUnit || fallbackIPE.ipe2Unit;
            } else {
                // Respecter les indications explicites de série quand présentes
                ipe1Unit = ((seriesMetricType?.trim() === 'IPE_kg') ? (baseIpeKgUnit || seriesIPE1Unit)
                    : (seriesMetricType?.trim() === 'IPE') ? (baseIpeUnit || seriesIPE1Unit)
                    : '') || seriesIPE1Unit || baseIpeKgUnit || baseIpeUnit || fallbackIPE.ipe1Unit;

                ipe2Unit = ((seriesMetricType?.trim() === 'IPE_kg') ? (baseIpeKgUnit)
                    : (seriesMetricType?.trim() === 'IPE') ? (baseIpeUnit)
                    : '') || baseIpeUnit || baseIpeKgUnit || fallbackIPE.ipe2Unit;
            }
        } else {
            // Mode IPE simple : utiliser la variante la plus appropriée
            const preferredUnit = baseIpeKgUnit || baseIpeUnit || seriesIPE1Unit || fallbackIPE.ipe1Unit;
            ipe1Unit = preferredUnit;
            ipe2Unit = preferredUnit; // Même unité pour les deux en mode simple
        }

        debug("Smart IPE Units resolved", { 
            ipe1Unit, 
            ipe2Unit, 
            seriesMetricType, 
            seriesEnergyType,
            variants: variants.length,
            fallback: fallbackIPE,
            isDoubleIPEEnabled,
            hasSeriesExplicit,
            baseIpeKgUnit,
            baseIpeUnit,
            seriesIPE1Unit
        });

        return { ipe1Unit, ipe2Unit };
    }, [
        smartVariables,
        detectedMode,
        detectedEnergyType,
        timeSeriesDataSource?.items,
        metricTypeAttr,
        energyTypeAttr
    ]);

    // Configuration énergétique basée sur la détection
    const energyConfig = useMemo(() => {
        return energyConfigs[detectedEnergyType.toLowerCase() as keyof typeof energyConfigs] || energyConfigs.elec;
    }, [detectedEnergyType]);

    // Traitement des données de séries temporelles avec validation améliorée
    useEffect(() => {
        // 🔍 DIAGNOSTIC DÉTAILLÉ DE LA SOURCE DE DONNÉES
        debug("🔍 DIAGNOSTIC - État de la source de données", {
            hasDataSource: !!timeSeriesDataSource,
            dataSourceStatus: timeSeriesDataSource?.status,
            itemsCount: timeSeriesDataSource?.items?.length || 0,
            hasTimestampAttr: !!timestampAttr,
            hasValueAttr: !!valueAttr,
            hasAssetNameAttr: !!assetNameAttr,
            hasMetricTypeAttr: !!metricTypeAttr,
            hasEnergyTypeAttr: !!energyTypeAttr,
            selectedAssetNames,
            detectedMode,
            detectedEnergyType
        });

        if (!timeSeriesDataSource || !timestampAttr || !valueAttr || !assetNameAttr) {
            debug("❌ Configuration incomplète", { 
                hasDataSource: !!timeSeriesDataSource, 
                hasTimestampAttr: !!timestampAttr, 
                hasValueAttr: !!valueAttr, 
                hasAssetNameAttr: !!assetNameAttr 
            });
            setError("Configuration incomplète. Vérifiez que tous les attributs requis sont configurés.");
            setIsLoading(false);
            return;
        }

        if (timeSeriesDataSource.status !== ValueStatus.Available) {
            debug("⏳ DataSource en cours de chargement", { status: timeSeriesDataSource.status });
            setIsLoading(timeSeriesDataSource.status === ValueStatus.Loading);
            return;
        }

        // 🔍 ANALYSE DES PREMIERS ÉLÉMENTS POUR DIAGNOSTIC
        if (timeSeriesDataSource.items && timeSeriesDataSource.items.length > 0) {
            const firstItem = timeSeriesDataSource.items[0];
            debug("🔍 DIAGNOSTIC - Premier élément", {
                timestamp: timestampAttr.get(firstItem)?.value,
                value: valueAttr.get(firstItem)?.value,
                assetName: assetNameAttr.get(firstItem)?.value,
                metricType: metricTypeAttr?.get(firstItem)?.value,
                energyType: energyTypeAttr?.get(firstItem)?.value
            });
        } else {
            // ⚠️ ATTENTION: Ne pas s'arrêter ici - laisser le traitement continuer
            // Les données peuvent arriver plus tard ou être filtrées par le traitement
            debug("⚠️ Aucun élément dans la source de données actuellement, mais on continue le traitement...");
            
            // Préparer IPEUnavailable pour le cas où aucune donnée n'arrive
            setIpeUnavailable({
                show: true,
                ipeCount: 0,
                fallbackReason: `Aucune donnée trouvée pour l'asset "${selectedAssetNames.join(", ")}" en mode ${detectedMode} (${detectedEnergyType}). Vérifiez votre XPath dans Mendix Studio Pro.`,
                recommendedMode: "fallback",
                availableAssets: []
            });
            // Ne pas retourner ici - laisser le traitement continuer
        }

        try {
            debug("Processing time series data with validation", {
                itemsCount: timeSeriesDataSource.items?.length,
                selectedAssets: selectedAssetNames,
                detectedMode,
                detectedEnergyType
            });

            // 🔍 LOGGING DÉTAILLÉ DES DONNÉES BRUTES
            const dataAnalysisResult = logDetailedDataAnalysis(
                timeSeriesDataSource,
                timestampAttr,
                valueAttr,
                assetNameAttr,
                metricTypeAttr,
                energyTypeAttr
            );
            setDataAnalysis(dataAnalysisResult);

            // 🔍 ANALYSE SPÉCIFIQUE MODE IPE
            if (detectedMode === "ipe") {
                logIPEDataAnalysis(dataAnalysisResult, selectedAssetNames);
            }

            // Utiliser le nouveau système de traitement avec validation
            const processingResult: ProcessingResult = processDataWithValidation(
                timeSeriesDataSource,
                timestampAttr,
                valueAttr,
                assetNameAttr,
                metricTypeAttr,
                energyTypeAttr,
                // Variables Smart pour validation IPE
                assetVariablesDataSource,
                variableNameAttr,
                variableUnitAttr,
                variableMetricTypeAttr,
                variableEnergyTypeAttr,
                {
                    selectedAssetNames,
                    viewMode: detectedMode,
                    energyType: detectedEnergyType,
                    maxDataPointsPerAsset: 1000, // Limite par défaut
                    enableStrictValidation: detectedMode === "ipe", // Validation stricte en mode IPE
                    debugMode: true // Toujours activer le debug pour diagnostiquer
                }
            );

            // Afficher les avertissements de traitement
            setProcessingWarnings(processingResult.warnings);

            // Logs de debug pour la validation IPE
            if (detectedMode === "ipe" && processingResult.validationSummary) {
                const { validCount, invalidCount, warnings } = processingResult.validationSummary;
                debug("IPE Validation Results", {
                    validAssets: validCount,
                    invalidAssets: invalidCount,
                    warnings
                });

                if (invalidCount > 0) {
                    console.warn("⚠️ Assets exclus en mode IPE:", processingResult.invalidAssets.map(a => a.name));
                }

                // 🔍 Gestion de l'affichage IPEUnavailable
                if (validCount === 0) {
                    const availableAssets = dataAnalysisResult.uniqueAssets.filter(asset => 
                        dataAnalysisResult.assetDataPoints[asset] > 0
                    );
                    
                    // Analyser pourquoi aucune donnée IPE n'est trouvée
                    const hasConsoData = Object.keys(dataAnalysisResult.metricTypeDistribution).includes('Conso');
                    const hasElecData = Object.keys(dataAnalysisResult.energyTypeDistribution).includes('Elec');
                    
                    let fallbackReason = "Aucune donnée IPE valide trouvée";
                    if (hasConsoData && hasElecData) {
                        fallbackReason = "Données de consommation électrique trouvées, mais pas d'IPE. Vérifiez le XPath de votre source de données.";
                    } else if (hasConsoData) {
                        fallbackReason = "Données de consommation trouvées, mais pas d'énergie électrique. Vérifiez le filtre d'énergie.";
                    } else {
                        fallbackReason = "Aucune donnée de consommation trouvée. Vérifiez votre source de données.";
                    }
                    
                    setIpeUnavailable({
                        show: true,
                        ipeCount: dataAnalysisResult.duplicateTimestamps.length,
                        fallbackReason,
                        recommendedMode: "fallback",
                        availableAssets
                    });
                } else {
                    setIpeUnavailable(null);
                }
            } else {
                setIpeUnavailable(null);
            }

            // Calculer les statistiques pour chaque asset valide
            const stats: AssetStats[] = processingResult.validAssets.map(asset => {
                const values = asset.values;
                if (values.length === 0) {
                    return {
                        name: asset.name,
                        currentValue: new Big(0),
                        maxValue: new Big(0),
                        minValue: new Big(0),
                        avgValue: new Big(0),
                        sumValue: new Big(0)
                    };
                }

                const currentValue = values[values.length - 1];
                const maxValue = values.reduce((max, val) => val.gt(max) ? val : max, values[0]);
                const minValue = values.reduce((min, val) => val.lt(min) ? val : min, values[0]);
                const sumValue = values.reduce((sum, val) => sum.plus(val), new Big(0));
                const avgValue = sumValue.div(values.length);

                return {
                    name: asset.name,
                    currentValue,
                    maxValue,
                    minValue,
                    avgValue,
                    sumValue
                };
            });

            setAssetsData(processingResult.validAssets);
            setAssetsStats(stats);
            
            // 🔍 VÉRIFICATION FINALE - S'assurer qu'il y a des données après traitement
            if (processingResult.validAssets.length === 0 && dataAnalysisResult.totalItems === 0) {
                debug("⚠️ Aucune donnée trouvée après traitement complet");
                
                // Utiliser IPEUnavailable au lieu d'une erreur simple
                const availableAssets = dataAnalysisResult.uniqueAssets.filter(asset => 
                    dataAnalysisResult.assetDataPoints[asset] > 0
                );
                
                let fallbackReason = "Aucune donnée trouvée pour les assets sélectionnés.";
                if (detectedMode === "ipe") {
                    fallbackReason = "Aucune donnée IPE trouvée. Vérifiez votre XPath dans Mendix Studio Pro.";
                } else {
                    fallbackReason = "Aucune donnée de consommation trouvée. Vérifiez votre XPath dans Mendix Studio Pro.";
                }
                
                setIpeUnavailable({
                    show: true,
                    ipeCount: 0,
                    fallbackReason,
                    recommendedMode: "fallback",
                    availableAssets
                });
                setError(null);
            } else {
                setError(null);
            }

            debug("Data processing complete", {
                assetsCount: processingResult.validAssets.length,
                totalDataPoints: processingResult.totalDataPoints,
                samplingApplied: processingResult.samplingApplied,
                processingTime: processingResult.processingTime
            });

            // 🔍 LOGGING DES DONNÉES APRÈS FILTRAGE
            logFilteredDataAnalysis(
                dataAnalysisResult,
                processingResult.validAssets,
                {
                    selectedAssetNames,
                    viewMode: detectedMode,
                    energyType: detectedEnergyType
                }
            );

        } catch (err) {
            debug("Error processing data", err);
            setError(err instanceof Error ? err.message : "Erreur de traitement des données");
        } finally {
            setIsLoading(false);
        }
    }, [
        timeSeriesDataSource,
        timestampAttr,
        valueAttr,
        assetNameAttr,
        metricTypeAttr,
        energyTypeAttr,
        assetVariablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr,
        selectedAssetNames,
        detectedMode,
        detectedEnergyType
    ]);

    // Affichage conditionnel selon l'état
    if (devMode) {
        return (
            <div className="widget-comparedata tw-p-4 tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg">
                <div className="tw-text-yellow-800 tw-font-medium tw-mb-2">Mode Développeur</div>
                <div className="tw-text-sm tw-text-yellow-700">
                    <div>Mode détecté: {detectedMode}</div>
                    <div>Type d'énergie: {detectedEnergyType}</div>
                    <div>Assets sélectionnés: {selectedAssetNames.join(", ") || "Aucun"}</div>
                    <div className="tw-font-medium tw-text-blue-600">🔧 Features:</div>
                    <div className="tw-ml-4">
                        <div>Double IPE: {isDoubleIPEEnabled ? "✅ Activé" : "❌ Désactivé"}</div>
                        <div>Granularité manuelle: {isGranulariteManuelleEnabled ? "✅ Activé" : "❌ Désactivé"}</div>
                    </div>
                    <div className="tw-font-medium tw-text-blue-600">📊 Données:</div>
                    <div className="tw-ml-4">
                        <div>Unités IPE résolues: {smartIPEUnits.ipe1Unit} / {smartIPEUnits.ipe2Unit}</div>
                        <div>Variables Smart: {smartVariables.length}</div>
                        <div>Assets valides: {assetsData.length}</div>
                    </div>
                    {processingWarnings.length > 0 && (
                        <div className="tw-mt-2">
                            <div className="tw-font-medium">Avertissements:</div>
                            <ul className="tw-list-disc tw-list-inside tw-text-xs">
                                {processingWarnings.map((warning, index) => (
                                    <li key={index} className="tw-text-orange-600">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {dataAnalysis && (
                        <div className="tw-mt-2">
                            <div className="tw-font-medium">Analyse des données:</div>
                            <div className="tw-text-xs tw-text-gray-600">
                                <div>Total: {dataAnalysis.totalItems} points</div>
                                <div>Assets: {dataAnalysis.uniqueAssets.length}</div>
                                <div>Doublons: {dataAnalysis.duplicateTimestamps.length}</div>
                                {dataAnalysis.duplicateTimestamps.length > 0 && (
                                    <div className="tw-text-orange-600 tw-font-medium">
                                        ⚠️ {dataAnalysis.duplicateTimestamps.length} timestamps en double détectés !
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="widget-comparedata tw-flex tw-items-center tw-justify-center tw-p-8">
                <div className="tw-text-gray-500">Chargement des données...</div>
            </div>
        );
    }

    if (error) {
        // En mode énergétique, afficher un écran dédié (consommation indisponible)
        if (detectedMode === "energetic") {
            return (
                <div className="widget-comparedata">
                    <ConsumptionUnavailable
                        consumptionCount={0}
                        fallbackReason={error}
                        recommendedMode="fallback"
                        selectedAssets={selectedAssetNames}
                        availableAssets={[]}
                    />
                </div>
            );
        }
        return (
            <div className="widget-comparedata tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg">
                <div className="tw-text-red-800 tw-font-medium tw-mb-2">Erreur</div>
                <div className="tw-text-sm tw-text-red-700">{error}</div>
            </div>
        );
    }

    if (selectedAssetNames.length === 0) {
        return (
            <div className="widget-comparedata">
                <NoDataMessage />
                <div className="tw-text-center tw-text-gray-500 tw-mt-4">
                    Veuillez sélectionner des assets à comparer
                </div>
            </div>
        );
    }

    // Affichage IPEUnavailable si nécessaire (seulement en mode IPE)
    if (ipeUnavailable?.show && detectedMode === "ipe") {
        return (
            <div className="widget-comparedata">
                <IPEUnavailable
                    ipeCount={ipeUnavailable.ipeCount}
                    fallbackReason={ipeUnavailable.fallbackReason}
                    recommendedMode={ipeUnavailable.recommendedMode}
                    selectedAssets={selectedAssetNames}
                    availableAssets={ipeUnavailable.availableAssets}
                />
            </div>
        );
    }

    // Affichage ConsumptionUnavailable si nécessaire (seulement en mode énergétique)
    if (ipeUnavailable?.show && detectedMode === "energetic") {
        return (
            <div className="widget-comparedata">
                <ConsumptionUnavailable
                    consumptionCount={0}
                    fallbackReason={ipeUnavailable.fallbackReason}
                    recommendedMode="fallback"
                    selectedAssets={selectedAssetNames}
                    availableAssets={ipeUnavailable.availableAssets}
                />
            </div>
        );
    }

    if (assetsData.length === 0) {
        return (
            <div className="widget-comparedata">
                <NoDataMessage />
            </div>
        );
    }

    // Rendu principal avec ChartContainer
    return (
        <div className="widget-comparedata">
            <ChartContainer
                data={assetsData}
                stats={assetsStats}
                energyConfig={energyConfig}
                viewMode={detectedMode as "energetic" | "ipe"}
                showDoubleIPEToggle={isDoubleIPEEnabled && detectedMode === "ipe"}
                showGranularityControls={isGranulariteManuelleEnabled && (detectedMode === "energetic" || detectedMode === "ipe")}
                onAddProductionClick={onAddProductionClick}
                startDate={dateRange?.[0]?.startDateAttr?.value}
                endDate={dateRange?.[0]?.endDateAttr?.value}
                // Labels intelligents pour IPE toggle — alignement Detailswidget (noms = unités résolues)
                ipe1Name={smartIPEUnits.ipe1Unit}
                ipe2Name={smartIPEUnits.ipe2Unit}
                // Props pour les contrôles d'affichage
                displayModeAttr={displayModeAttr}
                displayTimeAttr={displayTimeAttr}
                displayUnitAttr={displayUnitAttr}
                displayPreviewOKAttr={displayPreviewOKAttr}
                bufferModeAttr={bufferModeAttr}
                bufferTimeAttr={bufferTimeAttr}
                bufferUnitAttr={bufferUnitAttr}
                onModeChange={onModeChange}
                onTimeChange={onTimeChange}
            />
        </div>
    );
}