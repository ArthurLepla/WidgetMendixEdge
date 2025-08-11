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

        // Logique de résolution sophistiquée comme dans Detailswidget
        const hasSeriesExplicit = (seriesMetricType || '').trim() === 'IPE' || (seriesMetricType || '').trim() === 'IPE_kg';

        let ipe1Unit = '';
        let ipe2Unit = '';

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

        debug("Smart IPE Units resolved", { 
            ipe1Unit, 
            ipe2Unit, 
            seriesMetricType, 
            seriesEnergyType,
            variants: variants.length,
            fallback: fallbackIPE
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

    // Traitement des données de séries temporelles
    useEffect(() => {
        if (!timeSeriesDataSource || !timestampAttr || !valueAttr || !assetNameAttr) {
            setIsLoading(false);
            return;
        }

        if (timeSeriesDataSource.status !== ValueStatus.Available) {
            setIsLoading(timeSeriesDataSource.status === ValueStatus.Loading);
            return;
        }

        try {
            debug("Processing time series data", {
                itemsCount: timeSeriesDataSource.items?.length,
                selectedAssets: selectedAssetNames,
                detectedMode,
                detectedEnergyType
            });

            // Grouper les données par asset
            const dataByAsset = new Map<string, { timestamps: Date[]; values: Big[]; metricType?: string; energyType?: string }>();
            
            timeSeriesDataSource.items?.forEach(item => {
                const assetName = assetNameAttr.get(item)?.value;
                const timestamp = timestampAttr.get(item)?.value;
                const value = valueAttr.get(item)?.value;
                const metricType = metricTypeAttr?.get(item)?.value;
                const energyType = energyTypeAttr?.get(item)?.value;

                if (!assetName || !timestamp || !value) return;

                // Filtrer par assets sélectionnés si spécifié
                if (selectedAssetNames.length > 0 && !selectedAssetNames.includes(assetName)) {
                    return;
                }

                if (!dataByAsset.has(assetName)) {
                    dataByAsset.set(assetName, {
                        timestamps: [],
                        values: [],
                        metricType,
                        energyType
                    });
                }

                const assetData = dataByAsset.get(assetName)!;
                assetData.timestamps.push(timestamp);
                assetData.values.push(value);
            });

            // Convertir en format AssetData et trier par timestamp
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

            // Calculer les statistiques pour chaque asset
            const stats: AssetStats[] = processedAssets.map(asset => {
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

            setAssetsData(processedAssets);
            setAssetsStats(stats);
            setError(null);

            debug("Data processing complete", {
                assetsCount: processedAssets.length,
                totalDataPoints: processedAssets.reduce((sum, asset) => sum + asset.timestamps.length, 0)
            });

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
                    <div>Double IPE activé: {isDoubleIPEEnabled ? "Oui" : "Non"}</div>
                    <div>Granularité manuelle: {isGranulariteManuelleEnabled ? "Oui" : "Non"}</div>
                    <div>Unités IPE résolues: {smartIPEUnits.ipe1Unit} / {smartIPEUnits.ipe2Unit}</div>
                    <div>Variables Smart: {smartVariables.length}</div>
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
                showGranularityControls={isGranulariteManuelleEnabled}
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