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
    debugSmartVariables,
    WIDGET_TO_SMART_ENERGY_MAPPING,
    type SmartVariableData,
    type SmartEnergyType
} from "./utils/smartUnitUtils";
import { IPEUnavailable } from "./components/IPEUnavailable";
import { ConsumptionUnavailable } from "./components/ConsumptionUnavailable";

import "./ui/CompareData.css";

// Types pour les données d'assets - aligné avec le plan
export interface AssetData {
    name: string;
    timestamps: Date[];
    values: Big[];
    assetId: string;
    metricType?: string; // "Conso" | "IPE_kg" | "IPE"
    energyType?: string;
    unit: string; // Unité de la variable associée
}

export interface AssetStats {
    name: string;
    assetId: string;
    currentValue: Big;
    maxValue: Big;
    minValue: Big;
    avgValue: Big;
    sumValue: Big;
    totalConsommationIPE?: Big;
    totalProduction?: Big;
    ipeValue?: Big;
}

// Constantes pour les types de métriques alignées avec les enums Mendix
const METRIC_TYPES = {
    CONSO: "Conso",
    IPE: "IPE",
    IPE_KG: "IPE_kg", 
    PROD: "Prod",
    PROD_KG: "Prod_kg"
} as const;


// Système de debug simple
const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`[CompareData] ${message}`, data || "");
    }
};

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
        energyTypeConfig,
        selectedAssetNames,
        assetsDataSource,
        assetNameAttr,
        assetIsElecAttr,
        assetIsGazAttr,
        assetIsEauAttr,
        assetIsAirAttr,
        timeSeriesDataSource,
        timestampAttr,
        valueAttr,
        tsAssetAssociation,
        tsVariableAssociation,
        variablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr,
        startDateAttr,
        endDateAttr,
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
        onAssetClick,
        onAddProductionClick
    } = props;

    // États pour les données
    const [assetsData, setAssetsData] = useState<AssetData[]>([]);
    const [assetsStats, setAssetsStats] = useState<AssetStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [smartVariables, setSmartVariables] = useState<SmartVariableData[]>([]);
    const [processingWarnings, setProcessingWarnings] = useState<string[]>([]);
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

    // Log de montage du composant
    useEffect(() => {
        debug("CompareData :: mount", {
            viewModeConfig,
            energyTypeConfig,
            devMode,
            assetsCount: assetsDataSource?.items?.length || 0,
            timeSeriesCount: timeSeriesDataSource?.items?.length || 0,
            features: {
                doubleIPE: isDoubleIPEEnabled,
                granulariteManuelle: isGranulariteManuelleEnabled
            }
        });
        return () => debug("CompareData :: unmount");
    }, []);

    // Récupération des assets sélectionnés à partir du string concaténé fourni par Headers Widget
    const selectedAssets = useMemo(() => {
        if (!assetsDataSource || assetsDataSource.status !== ValueStatus.Available || !selectedAssetNames?.value) {
            return [];
        }

        // Parse des noms d'assets depuis le string concaténé
        const assetNamesList = selectedAssetNames.value
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        debug("📋 Parse asset names from Headers Widget", {
            rawString: selectedAssetNames.value,
            parsedNames: assetNamesList,
            availableAssets: assetsDataSource.items?.length || 0
        });

        // Trouver les assets correspondants dans la DataSource complète
        const matchedAssets: any[] = [];
        
        for (const assetName of assetNamesList) {
            const matchingAsset = (assetsDataSource.items || []).find(asset => {
                const name = assetNameAttr.get(asset)?.value;
                return name === assetName;
            });

            if (matchingAsset) {
                const name = assetNameAttr.get(matchingAsset)?.value || "Asset inconnu";
                const isElec = assetIsElecAttr?.get(matchingAsset)?.value || false;
                const isGaz = assetIsGazAttr?.get(matchingAsset)?.value || false;
                const isEau = assetIsEauAttr?.get(matchingAsset)?.value || false;
                const isAir = assetIsAirAttr?.get(matchingAsset)?.value || false;

                // Auto-détection du type d'énergie principal
                let primaryEnergyType = energyTypeConfig; // Par défaut, utiliser la config
                if (isElec) primaryEnergyType = "Elec";
                else if (isGaz) primaryEnergyType = "Gaz";
                else if (isEau) primaryEnergyType = "Eau";
                else if (isAir) primaryEnergyType = "Air";

                matchedAssets.push({
                    asset: matchingAsset,
                    id: matchingAsset.id,
                    name,
                    primaryEnergyType,
                    supportsElec: isElec,
                    supportsGaz: isGaz,
                    supportsEau: isEau,
                    supportsAir: isAir
                });

                debug("✅ Asset matched", {
                    requestedName: assetName,
                    foundAsset: name,
                    primaryEnergyType,
                    energySupport: { isElec, isGaz, isEau, isAir }
                });
            } else {
                debug("❌ Asset not found", { requestedName: assetName });
            }
        }

        debug("🎯 Final asset selection", {
            requested: assetNamesList.length,
            matched: matchedAssets.length,
            assets: matchedAssets.map(a => a.name)
        });

        return matchedAssets;
    }, [selectedAssetNames, assetsDataSource, assetNameAttr, assetIsElecAttr, assetIsGazAttr, assetIsEauAttr, assetIsAirAttr, energyTypeConfig]);

    // Chargement et extraction des variables Smart des assets
    useEffect(() => {
        const variables = extractSmartVariablesData(
            variablesDataSource,
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
        variablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr
    ]);

    // Résolution intelligente des unités IPE basée sur les métadonnées et la configuration
    const smartIPEUnits = useMemo(() => {
        if (viewModeConfig !== "ipe") return { ipe1Unit: "", ipe2Unit: "" };

        // Conversion du type d'énergie widget vers enum Smart
        const smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[energyTypeConfig] || 'Elec';
        
        // Variantes disponibles depuis les variables des assets
        const variants = getIPEVariantsFromVariables(smartVariables, smartEnergyType as SmartEnergyType);
        const baseIpeKgUnit = variants.find(v => v.metricType === 'IPE_kg')?.unit;
        const baseIpeUnit = variants.find(v => v.metricType === 'IPE')?.unit;

        // Fallback général
        const fallbackIPE = getSmartIPEUnits(smartVariables, energyTypeConfig);

        // Logique de résolution intelligente selon la feature Double IPE
        let ipe1Unit = '';
        let ipe2Unit = '';

        if (isDoubleIPEEnabled) {
            // Mode Double IPE activé : afficher les deux variantes
            ipe1Unit = baseIpeKgUnit || fallbackIPE.ipe1Unit;
            ipe2Unit = baseIpeUnit || fallbackIPE.ipe2Unit;
        } else {
            // Mode IPE simple : utiliser la variante la plus appropriée
            const preferredUnit = baseIpeKgUnit || baseIpeUnit || fallbackIPE.ipe1Unit;
            ipe1Unit = preferredUnit;
            ipe2Unit = preferredUnit; // Même unité pour les deux en mode simple
        }

        debug("Smart IPE Units resolved", { 
            ipe1Unit, 
            ipe2Unit, 
            energyTypeConfig,
            variants: variants.length,
            fallback: fallbackIPE,
            isDoubleIPEEnabled,
            baseIpeKgUnit,
            baseIpeUnit
        });

        return { ipe1Unit, ipe2Unit };
    }, [
        smartVariables,
        viewModeConfig,
        energyTypeConfig,
        isDoubleIPEEnabled
    ]);

    // Configuration énergétique basée sur la configuration
    const energyConfig = useMemo(() => {
        return energyConfigs[energyTypeConfig.toLowerCase() as keyof typeof energyConfigs] || energyConfigs.elec;
    }, [energyTypeConfig]);

    // Traitement des données temporelles avec validation
    useEffect(() => {
        debug("🔍 DIAGNOSTIC - État des sources de données", {
            hasAssetsDataSource: !!assetsDataSource,
            assetsStatus: assetsDataSource?.status,
            assetsCount: assetsDataSource?.items?.length || 0,
            hasTimeSeriesDataSource: !!timeSeriesDataSource,
            timeSeriesStatus: timeSeriesDataSource?.status,
            timeSeriesCount: timeSeriesDataSource?.items?.length || 0,
            hasTimestampAttr: !!timestampAttr,
            hasValueAttr: !!valueAttr,
            hasTsAssetAssociation: !!tsAssetAssociation,
            selectedAssetsCount: selectedAssets.length,
            viewModeConfig,
            energyTypeConfig,
            startDate: startDateAttr?.value,
            endDate: endDateAttr?.value
        });

        if (!assetsDataSource || !timeSeriesDataSource || !timestampAttr || !valueAttr || !tsAssetAssociation) {
            debug("❌ Configuration incomplète", { 
                hasAssetsDataSource: !!assetsDataSource,
                hasTimeSeriesDataSource: !!timeSeriesDataSource,
                hasTimestampAttr: !!timestampAttr,
                hasValueAttr: !!valueAttr,
                hasTsAssetAssociation: !!tsAssetAssociation
            });
            setError("Configuration incomplète. Vérifiez que toutes les sources de données sont configurées.");
            setIsLoading(false);
            return;
        }

        if (assetsDataSource.status !== ValueStatus.Available || timeSeriesDataSource.status !== ValueStatus.Available) {
            debug("⏳ Sources de données en cours de chargement", { 
                assetsStatus: assetsDataSource.status,
                timeSeriesStatus: timeSeriesDataSource.status
            });
            setIsLoading(
                assetsDataSource.status === ValueStatus.Loading || 
                timeSeriesDataSource.status === ValueStatus.Loading
            );
            return;
        }

        if (selectedAssets.length === 0) {
            debug("⚠️ Aucun asset sélectionné");
            setError("Aucun asset sélectionné pour la comparaison.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            
            // Traitement des données par asset avec filtrage intelligent
            const processedAssets: AssetData[] = [];
            const processedStats: AssetStats[] = [];
            const warnings: string[] = [];

            // Debug général des données d'entrée
            debug("🗺️ État global des données:", {
                selectedAssets: selectedAssets.length,
                assetsNames: selectedAssets.map(a => a.name),
                totalTimeSeriesPoints: timeSeriesDataSource.items?.length || 0,
                totalVariables: variablesDataSource?.items?.length || 0,
                viewMode: viewModeConfig,
                energyType: energyTypeConfig
            });

            // Debug associations TimeSeriesPoint pour diagnostic
            if (timeSeriesDataSource.items?.length) {
                const sampleTSPoints = timeSeriesDataSource.items.slice(0, 3);
                debug("🔍 Échantillon TimeSeriesPoints:", {
                    sample: sampleTSPoints.map(tsPoint => {
                        const assetRef = tsAssetAssociation?.get(tsPoint)?.value;
                        const variableRef = tsVariableAssociation?.get(tsPoint)?.value;
                        return {
                            tsPointId: tsPoint.id,
                            linkedAssetId: assetRef?.id || 'none',
                            linkedVariableId: variableRef?.id || 'none',
                            timestamp: timestampAttr?.get(tsPoint)?.value,
                            value: valueAttr?.get(tsPoint)?.value
                        };
                    })
                });
            }

            selectedAssets.forEach(assetInfo => {
                debug(`📋 Traitement asset: ${assetInfo.name}`, {
                    id: assetInfo.id,
                    primaryEnergyType: assetInfo.primaryEnergyType
                });

                // Filtrer les TimeSeriesPoint pour cet asset
                const assetTimeSeriesPoints = (timeSeriesDataSource.items || []).filter(tsPoint => {
                    const linkedAssetId = tsAssetAssociation.get(tsPoint)?.value?.id;
                    return linkedAssetId === assetInfo.id;
                });

                debug(`🔍 Points temporels trouvés pour ${assetInfo.name}:`, {
                    count: assetTimeSeriesPoints.length,
                    sampleIds: assetTimeSeriesPoints.slice(0, 3).map(p => p.id)
                });

                if (assetTimeSeriesPoints.length === 0) {
                    // Debug détaillé quand aucun TimeSeriesPoint
                    debug(`❌ Aucun TimeSeriesPoint pour ${assetInfo.name}:`, {
                        assetId: assetInfo.id,
                        totalTSPoints: timeSeriesDataSource.items?.length || 0,
                        assetName: assetInfo.name
                    });
                    
                    // Vérifier s'il y a des variables pour cet asset qui pourraient indiquer des données manquantes
                    const assetVariables = (variablesDataSource?.items || []).filter(variable => {
                        if (!tsVariableAssociation) return false;
                        const linkedAssetRef = tsVariableAssociation.get(variable)?.value;
                        return linkedAssetRef?.id === assetInfo.id;
                    });
                    
                    debug(`📋 Variables disponibles pour ${assetInfo.name}:`, {
                        count: assetVariables.length,
                        variables: assetVariables.slice(0, 5).map(v => ({
                            id: v.id,
                            name: variableNameAttr?.get(v)?.value,
                            metricType: variableMetricTypeAttr?.get(v)?.value,
                            energyType: variableEnergyTypeAttr?.get(v)?.value
                        }))
                    });
                    
                    warnings.push(`Aucune donnée temporelle trouvée pour l'asset "${assetInfo.name}" - Vérifiez que CalculateAssetCompleteMetrics a été exécuté`);
                    return;
                }

                // Filtrage simplifé selon le plan : pas de Production, focus sur Conso et IPE seulement
                const filteredPoints = assetTimeSeriesPoints.filter(tsPoint => {
                    // 1) Récupérer la variable associée au point via tsVariableAssociation
                    const variableRef = tsVariableAssociation?.get(tsPoint)?.value;
                    if (!variableRef) {
                        // FALLBACK TEMPORAIRE : si pas d'association Variable mais qu'on a des variables pour cet asset
                        debug(`⚠️ TimeSeriesPoint ${tsPoint.id} sans association Variable - tentative fallback`);
                        
                        // Si on n'a pas l'association, on peut quand même essayer de filtrer les variables par asset
                        // et accepter tous les points de cet asset (moins précis mais fonctionnel)
                        const assetVariables = (variablesDataSource?.items || []).filter(variable => {
                            if (!tsVariableAssociation) return true; // Pas de vérif possible
                            const linkedAssetRef = tsVariableAssociation.get(variable)?.value;
                            return linkedAssetRef?.id === assetInfo.id;
                        });
                        
                        const hasValidVariables = assetVariables.some(variable => {
                            const metricType = variableMetricTypeAttr?.get(variable)?.value as string;
                            const energyType = variableEnergyTypeAttr?.get(variable)?.value as string;
                            
                            if (viewModeConfig === "energetic") {
                                return metricType === METRIC_TYPES.CONSO && energyType === energyTypeConfig;
                            } else if (viewModeConfig === "ipe") {
                                return (metricType === METRIC_TYPES.IPE || metricType === METRIC_TYPES.IPE_KG) && energyType === energyTypeConfig;
                            }
                            return false;
                        });
                        
                        debug(`🔄 Fallback pour ${assetInfo.name}:`, {
                            assetVariables: assetVariables.length,
                            hasValidVariables
                        });
                        
                        return hasValidVariables;
                    }

                    // 2) Trouver la variable correspondante dans variablesDataSource
                    const variable = (variablesDataSource?.items || []).find(v => v.id === variableRef.id);
                    if (!variable) {
                        debug(`❌ Variable ${variableRef.id} introuvable - SKIP`);
                        return false;
                    }

                    // 3) Vérification optionnelle : variable liée à l'asset
                    if (tsVariableAssociation) {
                        const linkedAssetRef = tsVariableAssociation.get(variable)?.value;
                        if (linkedAssetRef?.id !== assetInfo.id) {
                            debug(`❌ Variable ${variable.id} pas liée à l'asset ${assetInfo.name} - SKIP`);
                            return false;
                        }
                    }

                    // 4) Extraire MetricType et EnergyType
                    const metricType = variableMetricTypeAttr?.get(variable)?.value as string;
                    const energyType = variableEnergyTypeAttr?.get(variable)?.value as string;
                    const variableName = variableNameAttr?.get(variable)?.value;
                    const variableUnit = variableUnitAttr?.get(variable)?.value;

                    debug(`🔍 Filtrage point:`, {
                        tsPointId: tsPoint.id,
                        variableId: variable.id,
                        variableName,
                        metricType,
                        energyType,
                        unit: variableUnit,
                        targetMode: viewModeConfig,
                        targetEnergyType: energyTypeConfig,
                        assetName: assetInfo.name
                    });

                    // 5) Filtrage par mode selon le plan
                    if (viewModeConfig === "energetic") {
                        // Energetic: MetricType=Conso, EnergyType=widget config
                        const validMetric = metricType === METRIC_TYPES.CONSO;
                        const validEnergy = energyType === energyTypeConfig;
                        
                        if (!validMetric) {
                            debug(`❌ Energetic: MetricType ${metricType} !== ${METRIC_TYPES.CONSO}`);
                        }
                        if (!validEnergy) {
                            debug(`❌ Energetic: EnergyType ${energyType} !== ${energyTypeConfig}`);
                        }
                        
                        return validMetric && validEnergy;
                    } 
                    
                    if (viewModeConfig === "ipe") {
                        // IPE: MetricType=IPE ou IPE_kg, EnergyType=widget config, PAS de Production
                        const validMetric = (metricType === METRIC_TYPES.IPE || metricType === METRIC_TYPES.IPE_KG);
                        const validEnergy = energyType === energyTypeConfig;
                        
                        if (!validMetric) {
                            debug(`❌ IPE: MetricType ${metricType} not in [${METRIC_TYPES.IPE}, ${METRIC_TYPES.IPE_KG}]`);
                        }
                        if (!validEnergy) {
                            debug(`❌ IPE: EnergyType ${energyType} !== ${energyTypeConfig}`);
                        }
                        
                        return validMetric && validEnergy;
                    }

                    debug(`❌ Mode ${viewModeConfig} non supporté`);
                    return false;
                });

                debug(`✅ Points filtrés pour ${assetInfo.name}:`, filteredPoints.length);

                if (filteredPoints.length === 0) {
                    // Debug détaillé en cas d'échec
                    debug(`❌ Échec filtrage pour ${assetInfo.name}:`, {
                        totalTSPoints: assetTimeSeriesPoints.length,
                        filteredPoints: filteredPoints.length,
                        targetMode: viewModeConfig,
                        targetEnergy: energyTypeConfig,
                        availableVariables: (variablesDataSource?.items || []).length
                    });
                    
                    // Analyser les premiers points pour comprendre pourquoi ils sont rejetés
                    const debugSample = assetTimeSeriesPoints.slice(0, 2);
                    debugSample.forEach((tsPoint, idx) => {
                        const varRef = tsVariableAssociation?.get(tsPoint)?.value;
                        debug(`💬 Debug point ${idx}:`, {
                            tsPointId: tsPoint.id,
                            hasVariableRef: !!varRef,
                            variableRefId: varRef?.id || 'none'
                        });
                        
                        if (varRef) {
                            const variable = (variablesDataSource?.items || []).find(v => v.id === varRef.id);
                            if (variable) {
                                const mt = variableMetricTypeAttr?.get(variable)?.value;
                                const et = variableEnergyTypeAttr?.get(variable)?.value;
                                debug(`💬 Variable ${varRef.id}:`, {
                                    metricType: mt,
                                    energyType: et,
                                    name: variableNameAttr?.get(variable)?.value,
                                    unit: variableUnitAttr?.get(variable)?.value
                                });
                            } else {
                                debug(`❌ Variable ${varRef.id} introuvable`);
                            }
                        }
                    });
                    
                    warnings.push(`Aucune donnée correspondant au filtre (${viewModeConfig}/${energyTypeConfig}) pour l'asset "${assetInfo.name}"`);
                    return;
                }

                // Extraire les données temporelles
                const timestamps: Date[] = [];
                const values: Big[] = [];

                filteredPoints.forEach(tsPoint => {
                    const timestamp = timestampAttr.get(tsPoint)?.value;
                    const value = valueAttr.get(tsPoint)?.value;

                    if (timestamp && value !== undefined) {
                        timestamps.push(timestamp);
                        values.push(new Big(value));
                    }
                });

                if (timestamps.length === 0) {
                    warnings.push(`Données temporelles invalides pour l'asset "${assetInfo.name}"`);
                    return;
                }

                // Trier par timestamp croissant
                const sortedData = timestamps
                    .map((timestamp, index) => ({ timestamp, value: values[index] }))
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                const sortedTimestamps = sortedData.map(d => d.timestamp);
                const sortedValues = sortedData.map(d => d.value);

                // Calculer les statistiques
                const currentValue = sortedValues[sortedValues.length - 1];
                const maxValue = sortedValues.reduce((max, val) => val.gt(max) ? val : max, sortedValues[0]);
                const minValue = sortedValues.reduce((min, val) => val.lt(min) ? val : min, sortedValues[0]);
                const sumValue = sortedValues.reduce((sum, val) => sum.plus(val), new Big(0));
                const avgValue = sumValue.div(sortedValues.length);

                // Déterminer l'unité depuis la première variable trouvée pour cet asset
                let assetUnit = "";
                if (filteredPoints.length > 0) {
                    const firstPoint = filteredPoints[0];
                    const firstVarRef = tsVariableAssociation?.get(firstPoint)?.value;
                    if (firstVarRef) {
                        const firstVar = (variablesDataSource?.items || []).find(v => v.id === firstVarRef.id);
                        assetUnit = variableUnitAttr?.get(firstVar!)?.value || "";
                    }
                }

                // Fallback unit si variable sans unité
                if (!assetUnit) {
                    assetUnit = viewModeConfig === "energetic" 
                        ? energyConfig.unit 
                        : smartIPEUnits.ipe1Unit;
                }

                // Mode IPE: utiliser IPE_kg par défaut (plan priorité)
                const assetMetricType = viewModeConfig === "energetic" 
                    ? METRIC_TYPES.CONSO 
                    : METRIC_TYPES.IPE_KG;

                // Créer les objets de données avec unité
                processedAssets.push({
                    name: assetInfo.name,
                    assetId: assetInfo.id,
                    timestamps: sortedTimestamps,
                    values: sortedValues,
                    metricType: assetMetricType,
                    energyType: energyTypeConfig,
                    unit: assetUnit
                });

                processedStats.push({
                    name: assetInfo.name,
                    assetId: assetInfo.id,
                    currentValue,
                    maxValue,
                    minValue,
                    avgValue,
                    sumValue
                });

                debug(`✅ Asset ${assetInfo.name} traité avec succès:`, {
                    dataPoints: sortedValues.length,
                    currentValue: currentValue.toString(),
                    avgValue: avgValue.toString()
                });
            });

            setProcessingWarnings(warnings);
            setAssetsData(processedAssets);
            setAssetsStats(processedStats);

            // Gestion des cas IPE unavailable
            if (viewModeConfig === "ipe" && processedAssets.length === 0) {
                const availableAssets = selectedAssets.map(a => a.name);
                setIpeUnavailable({
                    show: true,
                    ipeCount: 0,
                    fallbackReason: `Aucune donnée IPE trouvée pour le type d'énergie ${energyTypeConfig}. Vérifiez la configuration de vos variables.`,
                    recommendedMode: "fallback",
                    availableAssets
                });
                setError(null);
            } else {
                setIpeUnavailable(null);
                setError(null);
            }

            debug("Traitement des données terminé", {
                processedAssets: processedAssets.length,
                totalDataPoints: processedAssets.reduce((sum, asset) => sum + asset.values.length, 0),
                warnings: warnings.length
            });

        } catch (err) {
            debug("Erreur lors du traitement des données", err);
            setError(err instanceof Error ? err.message : "Erreur de traitement des données");
        } finally {
            setIsLoading(false);
        }
    }, [
        assetsDataSource,
        timeSeriesDataSource,
        timestampAttr,
        valueAttr,
        tsAssetAssociation,
        variablesDataSource,
        variableMetricTypeAttr,
        variableEnergyTypeAttr,
        selectedAssets,
        viewModeConfig,
        energyTypeConfig,
        startDateAttr,
        endDateAttr
    ]);

    // Affichage conditionnel selon l'état
    if (devMode) {
        return (
            <div className="widget-comparedata tw-p-4 tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg">
                <div className="tw-text-yellow-800 tw-font-medium tw-mb-2">Mode Développeur - CompareData Refactorisé</div>
                <div className="tw-text-sm tw-text-yellow-700">
                    <div>Mode: {viewModeConfig}</div>
                    <div>Type d'énergie: {energyTypeConfig}</div>
                    <div>Assets sélectionnés: {selectedAssets.length}</div>
                    <div className="tw-font-medium tw-text-blue-600">🔧 Features:</div>
                    <div className="tw-ml-4">
                        <div>Double IPE: {isDoubleIPEEnabled ? "✅ Activé" : "❌ Désactivé"}</div>
                        <div>Granularité manuelle: {isGranulariteManuelleEnabled ? "✅ Activé" : "❌ Désactivé"}</div>
                    </div>
                    <div className="tw-font-medium tw-text-blue-600">📊 Données:</div>
                    <div className="tw-ml-4">
                        <div>Unités IPE résolues: {smartIPEUnits.ipe1Unit} / {smartIPEUnits.ipe2Unit}</div>
                        <div>Variables Smart: {smartVariables.length}</div>
                        <div>Assets traités: {assetsData.length}</div>
                        <div>Points temporels totaux: {assetsData.reduce((sum, asset) => sum + asset.values.length, 0)}</div>
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
        if (viewModeConfig === "energetic") {
            return (
                <div className="widget-comparedata">
                    <ConsumptionUnavailable
                        consumptionCount={0}
                        fallbackReason={error}
                        recommendedMode="fallback"
                        selectedAssets={selectedAssets.map(a => a.name)}
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

    if (selectedAssets.length === 0) {
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
    if (ipeUnavailable?.show && viewModeConfig === "ipe") {
        return (
            <div className="widget-comparedata">
                <IPEUnavailable
                    ipeCount={ipeUnavailable.ipeCount}
                    fallbackReason={ipeUnavailable.fallbackReason}
                    recommendedMode={ipeUnavailable.recommendedMode}
                    selectedAssets={selectedAssets.map(a => a.name)}
                    availableAssets={ipeUnavailable.availableAssets}
                />
            </div>
        );
    }

    // Affichage ConsumptionUnavailable si nécessaire (seulement en mode énergétique)
    if (ipeUnavailable?.show && viewModeConfig === "energetic") {
        return (
            <div className="widget-comparedata">
                <ConsumptionUnavailable
                    consumptionCount={0}
                    fallbackReason={ipeUnavailable.fallbackReason}
                    recommendedMode="fallback"
                    selectedAssets={selectedAssets.map(a => a.name)}
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
                viewMode={viewModeConfig as "energetic" | "ipe"}
                showDoubleIPEToggle={isDoubleIPEEnabled && viewModeConfig === "ipe"}
                showGranularityControls={isGranulariteManuelleEnabled && (viewModeConfig === "energetic" || viewModeConfig === "ipe")}
                onAddProductionClick={onAddProductionClick}
                startDate={startDateAttr?.value}
                endDate={endDateAttr?.value}
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
                // Actions spécifiques au comparatif
                onAssetClick={(assetId: string) => {
                    const asset = selectedAssets.find(a => a.id === assetId)?.asset;
                    if (asset && onAssetClick) {
                        const action = onAssetClick.get(asset);
                        if (action && action.canExecute) {
                            action.execute();
                        }
                    }
                }}
                selectedAssets={selectedAssets.map(a => ({ id: a.id, name: a.name }))}
            />
        </div>
    );
}