import { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import Big from "big.js";
import { ValueStatus } from "mendix";
import { Inbox } from "lucide-react";

import { CompareDataContainerProps } from "../typings/CompareDataProps";
import { ChartContainer } from "./components/ChartContainer/ChartContainer";
import { useDoubleIPEToggle, useGranulariteManuelleToggle, useDebugFeatures } from "./hooks/use-feature-toggle";
import { energyConfigs, getMetricTypeFromName } from "./utils/energy";
import { 
    extractSmartVariablesData, 
    getSmartIPEUnits, 
    debugSmartVariables,
    type SmartVariableData
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
    
    // Debug des features (temporaire)
    useDebugFeatures(featureList, featureNameAttr);
    
    // Log forcé pour diagnostiquer les features (temporaire)
    useEffect(() => {
        console.log("🔍 DEBUG FORCÉ - Features dans CompareData:", {
            featureList: featureList?.status,
            featureNameAttr: !!featureNameAttr,
            featureListItems: featureList?.items?.length || 0,
            isDoubleIPEEnabled,
            isGranulariteManuelleEnabled,
            devMode
        });
        
        // Log détaillé des features si disponibles
        if (featureList?.status === ValueStatus.Available && featureNameAttr) {
            const features = (featureList.items || [])
                .map(item => featureNameAttr.get(item)?.value)
                .filter((value): value is string => !!value);
            
            console.log("🔍 DEBUG FORCÉ - Features détectées:", {
                allFeatures: features,
                count: features.length,
                hasGranulariteManuelle: features.includes("Granularite_Manuelle"),
                hasDoubleIPE: features.includes("Double_IPE"),
                hasGranulariteManuelleAlt: features.includes("Granularité_Manuelle"),
                hasDoubleIPEAlt: features.includes("DoubleIPE")
            });
        }
    }, [featureList, featureNameAttr, isDoubleIPEEnabled, isGranulariteManuelleEnabled, devMode]);

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

    // Détection du double IPE et résolution des unités basée sur les variables des assets sélectionnés
    const { smartIPEUnits, hasDoubleIPESupport } = useMemo(() => {
        if (viewModeConfig !== "ipe") {
            return { smartIPEUnits: { ipe1Unit: "", ipe2Unit: "" }, hasDoubleIPESupport: false };
        }

        // Conversion du type d'énergie widget vers enum Smart (pour référence future)
        // const smartEnergyType = WIDGET_TO_SMART_ENERGY_MAPPING[energyTypeConfig] || 'Elec';
        
        // Scanner les variables des assets sélectionnés pour détecter le double IPE
        const selectedAssetIds = selectedAssets.map(a => a.id);
        const relevantVariables = (variablesDataSource?.items || []).filter(variable => {
            // Vérifier si la variable a le bon type d'énergie
            const varEnergyType = variableEnergyTypeAttr?.get(variable)?.value;
            if (varEnergyType !== energyTypeConfig) return false;
            
            // Vérifier si la variable est liée à un asset sélectionné
            // Note: nous devons vérifier via les TimeSeriesPoints pour trouver la liaison
            const isLinkedToSelectedAsset = (timeSeriesDataSource?.items || []).some(tsPoint => {
                const assetRef = tsAssetAssociation?.get(tsPoint)?.value;
                const variableRef = tsVariableAssociation?.get(tsPoint)?.value;
                return assetRef && selectedAssetIds.includes(assetRef.id) && 
                       variableRef && variableRef.id === variable.id;
            });
            
            return isLinkedToSelectedAsset;
        });
        
        // Rechercher les types IPE disponibles
        const availableIPETypes = new Set<string>();
        const unitsByType = new Map<string, string>();
        
        relevantVariables.forEach(variable => {
            const metricType = variableMetricTypeAttr?.get(variable)?.value as string;
            const unit = variableUnitAttr?.get(variable)?.value as string || "";
            
            if (metricType === METRIC_TYPES.IPE || metricType === METRIC_TYPES.IPE_KG) {
                availableIPETypes.add(metricType);
                if (!unitsByType.has(metricType) && unit) {
                    unitsByType.set(metricType, unit);
                }
            }
        });
        
        const hasIPE_kg = availableIPETypes.has(METRIC_TYPES.IPE_KG);
        const hasIPE = availableIPETypes.has(METRIC_TYPES.IPE);
        const doubleIPESupport = hasIPE_kg && hasIPE;
        
        // Fallback général
        const fallbackIPE = getSmartIPEUnits(smartVariables, energyTypeConfig);
        
        // Résolution des unités
        let ipe1Unit = unitsByType.get(METRIC_TYPES.IPE_KG) || fallbackIPE.ipe1Unit;
        let ipe2Unit = unitsByType.get(METRIC_TYPES.IPE) || fallbackIPE.ipe2Unit;
        
        // En mode simple, utiliser la variante disponible
        if (!isDoubleIPEEnabled || !doubleIPESupport) {
            const preferredUnit = ipe1Unit || ipe2Unit || fallbackIPE.ipe1Unit;
            ipe1Unit = preferredUnit;
            ipe2Unit = preferredUnit;
        }

        debug("Double IPE detection et unités résolues", { 
            ipe1Unit, 
            ipe2Unit, 
            energyTypeConfig,
            hasIPE_kg,
            hasIPE,
            doubleIPESupport,
            isDoubleIPEEnabled,
            relevantVariables: relevantVariables.length,
            selectedAssets: selectedAssets.length,
            availableTypes: Array.from(availableIPETypes)
        });

        return { 
            smartIPEUnits: { ipe1Unit, ipe2Unit }, 
            hasDoubleIPESupport: doubleIPESupport 
        };
    }, [
        smartVariables,
        viewModeConfig,
        energyTypeConfig,
        isDoubleIPEEnabled,
        selectedAssets,
        variablesDataSource,
        timeSeriesDataSource,
        variableEnergyTypeAttr,
        variableMetricTypeAttr,
        variableUnitAttr,
        tsAssetAssociation,
        tsVariableAssociation
    ]);

    // Configuration énergétique basée sur la configuration
    const energyConfig = useMemo(() => {
        return energyConfigs[energyTypeConfig as keyof typeof energyConfigs] || energyConfigs.Elec;
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
                    
                    // Vérifier s'il y a des variables pour cet asset via les TimeSeriesPoints
                    const assetVariableIds = new Set<string>();
                    (timeSeriesDataSource?.items || []).forEach(tsPoint => {
                        const tsAssetRef = tsAssetAssociation?.get(tsPoint)?.value;
                        const tsVariableRef = tsVariableAssociation?.get(tsPoint)?.value;
                        if (tsAssetRef?.id === assetInfo.id && tsVariableRef) {
                            assetVariableIds.add(tsVariableRef.id);
                        }
                    });
                    
                    const assetVariables = (variablesDataSource?.items || []).filter(variable => 
                        assetVariableIds.has(variable.id)
                    );
                    
                    debug(`📋 Variables disponibles pour ${assetInfo.name}:`, {
                        count: assetVariables.length,
                        variables: assetVariables.slice(0, 5).map(v => ({
                            id: v.id,
                            name: variableNameAttr?.get(v)?.value,
                            metricType: variableMetricTypeAttr?.get(v)?.value,
                            energyType: variableEnergyTypeAttr?.get(v)?.value
                        }))
                    });
                    
                    // Message d'erreur plus spécifique avec recommandations
                    const errorMessage = `Aucune donnée temporelle trouvée pour l'asset "${assetInfo.name}" - ` +
                        `Exécutez l'action "CalculateAssetCompleteMetrics" avec : ` +
                        `SelectedAssetName="${assetInfo.name}", EnergyType="${energyTypeConfig}", ` +
                        `DateRange=${startDateAttr?.value?.toISOString()} à ${endDateAttr?.value?.toISOString()}`;
                    
                    warnings.push(errorMessage);
                    return;
                }



                // Filtrage correct avec vérification des associations Variable-Asset
                const filteredPointsWithVariables = assetTimeSeriesPoints.map(tsPoint => {
                    // 1) Récupérer la variable associée au point via tsVariableAssociation
                    const variableRef = tsVariableAssociation?.get(tsPoint)?.value;
                    
                    if (!variableRef) {
                        debug(`❌ TimeSeriesPoint ${tsPoint.id} sans association Variable - SKIP`);
                        return null;
                    }

                    // 2) Trouver la variable correspondante dans variablesDataSource
                    const variable = (variablesDataSource?.items || []).find(v => v.id === variableRef.id) || (variableRef as any);
                    if ((variablesDataSource?.items || []).find(v => v.id === variableRef.id) == null) {
                        // La variable n'est pas dans la DS fournie — on tente un fallback direct via l'association
                        debug(`⚠️ Variable ${variableRef.id} absente de variablesDataSource — utilisation du fallback via association`);
                    }



                    // 3) Vérification stricte : variable liée à l'asset correct
                    const variableAssetRef = tsAssetAssociation?.get(tsPoint)?.value;
                    if (!variableAssetRef || variableAssetRef.id !== assetInfo.id) {
                        debug(`❌ TimeSeriesPoint ${tsPoint.id} pas lié à l'asset ${assetInfo.name} - SKIP`);
                        return null;
                    }

                    // 4) Extraire MetricType et EnergyType avec fallbacks robustes
                    let metricType = "" as string;
                    let energyType = undefined as string | undefined;
                    let variableName = undefined as string | undefined;
                    let variableUnit = undefined as string | undefined;
                    try {
                        metricType = (variableMetricTypeAttr?.get(variable as any)?.value as string) || "";
                        energyType = variableEnergyTypeAttr?.get(variable as any)?.value as string | undefined;
                        variableName = variableNameAttr?.get(variable as any)?.value;
                        variableUnit = variableUnitAttr?.get(variable as any)?.value;
                    } catch (e) {
                        debug("⚠️ Lecture attributs variable via fallback a échoué", { error: (e as Error)?.message });
                    }

                    // Fallback: déduire le metricType depuis le nom si l'attribut est vide
                    if (!metricType || metricType.trim().length === 0) {
                        const inferred = getMetricTypeFromName(variableName);
                        if (inferred) metricType = inferred;
                    }

                    debug(`🔍 Évaluation point:`, {
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

                    // 5) Filtrage par mode
                    let isValid = false;
                    if (viewModeConfig === "energetic") {
                        // Energetic: MetricType=Conso, EnergyType=widget config (tolérer energyType manquant ou "None")
                        const energyMatches = !energyType || energyType === energyTypeConfig || energyType === "None";
                        isValid = metricType === METRIC_TYPES.CONSO && energyMatches;

                    } else if (viewModeConfig === "ipe") {
                        // IPE: MetricType=IPE ou IPE_kg, EnergyType=widget config
                        isValid = (metricType === METRIC_TYPES.IPE || metricType === METRIC_TYPES.IPE_KG) && energyType === energyTypeConfig;

                    }

                    if (!isValid) {
                        debug(`❌ Point rejeté: mode=${viewModeConfig}, metric=${metricType}, energy=${energyType}`, {
                            reason: viewModeConfig === "energetic"
                                ? {
                                    expectedMetric: METRIC_TYPES.CONSO,
                                    energyTypeConfig,
                                    energyMatches: (!energyType || energyType === energyTypeConfig)
                                  }
                                : {
                                    expectedMetric: [METRIC_TYPES.IPE, METRIC_TYPES.IPE_KG],
                                    energyTypeConfig
                                  }
                        });
                        return null;
                    }

                    return {
                        tsPoint,
                        variable,
                        metricType,
                        energyType,
                        variableName,
                        variableUnit: variableUnit || ""
                    };
                }).filter(item => item !== null);

                debug(`✅ Points filtrés pour ${assetInfo.name}:`, filteredPointsWithVariables.length);

                if (filteredPointsWithVariables.length === 0) {
                    // Message d'erreur spécifique selon le mode
                    const modeLabel = viewModeConfig === "energetic" ? "consommation" : "IPE";
                    const errorMessage = `Aucune donnée ${modeLabel} trouvée pour l'asset "${assetInfo.name}" avec le type d'énergie ${energyTypeConfig}. Vérifiez que les variables sont correctement associées et que CalculateAssetCompleteMetrics a été exécuté.`;
                    
                    debug(`❌ ${errorMessage}`, {
                        totalTSPoints: assetTimeSeriesPoints.length,
                        targetMode: viewModeConfig,
                        targetEnergy: energyTypeConfig,
                        availableVariables: (variablesDataSource?.items || []).length
                    });
                    
                    warnings.push(errorMessage);
                    return;
                }

                // Grouper les points par type de métrique pour support du double IPE
                const pointsByMetricType = new Map<string, typeof filteredPointsWithVariables>();
                filteredPointsWithVariables.forEach(item => {
                    const key = item.metricType;
                    if (!pointsByMetricType.has(key)) {
                        pointsByMetricType.set(key, []);
                    }
                    pointsByMetricType.get(key)!.push(item);
                });

                debug(`📊 Métriques disponibles pour ${assetInfo.name}:`, {
                    metrics: Array.from(pointsByMetricType.keys()),
                    counts: Array.from(pointsByMetricType.entries()).map(([k, v]) => ({ [k]: v.length }))
                });

                // Traiter chaque type de métrique séparément
                // En mode IPE simple (pas de double IPE actif), ne garder qu'une variante:
                // priorité à IPE_kg, sinon IPE si IPE_kg indisponible
                const metricTypesAvailable = Array.from(pointsByMetricType.keys());
                const singleIPEmode = viewModeConfig === "ipe" && (!isDoubleIPEEnabled || !hasDoubleIPESupport);
                const allowedMetricTypes: string[] = singleIPEmode
                    ? (metricTypesAvailable.includes(METRIC_TYPES.IPE_KG)
                        ? [METRIC_TYPES.IPE_KG]
                        : [metricTypesAvailable[0]])
                    : metricTypesAvailable;

                allowedMetricTypes.forEach((metricType) => {
                    const pointsWithVars = pointsByMetricType.get(metricType)!;
                    // Extraire les données temporelles
                    const temporalData = pointsWithVars.map(item => {
                        const timestamp = timestampAttr.get(item.tsPoint)?.value;
                        const value = valueAttr.get(item.tsPoint)?.value;

                        return { timestamp, value, unit: item.variableUnit };
                    }).filter(d => d.timestamp && d.value !== undefined);

                    if (temporalData.length === 0) {
                        warnings.push(`Données temporelles invalides pour l'asset "${assetInfo.name}" métrique ${metricType}`);
                        return;
                    }

                    // Trier par timestamp croissant
                    const sortedData = temporalData
                        .map(d => ({ timestamp: d.timestamp!, value: new Big(d.value!), unit: d.unit }))
                        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                    const sortedTimestamps = sortedData.map(d => d.timestamp);
                    const sortedValues = sortedData.map(d => d.value);
                    
                    // Récupérer l'unité depuis la variable (prioritaire) ou fallback
                    let assetUnit = sortedData[0].unit || "";
                    if (!assetUnit) {
                        if (viewModeConfig === "energetic") {
                            assetUnit = energyConfig.unit;
                        } else if (metricType === METRIC_TYPES.IPE_KG) {
                            assetUnit = smartIPEUnits.ipe1Unit;
                        } else if (metricType === METRIC_TYPES.IPE) {
                            assetUnit = smartIPEUnits.ipe2Unit;
                        } else {
                            assetUnit = smartIPEUnits.ipe1Unit; // fallback
                        }
                    }

                    // Calculer les statistiques
                    const currentValue = sortedValues[sortedValues.length - 1];
                    const maxValue = sortedValues.reduce((max, val) => val.gt(max) ? val : max, sortedValues[0]);
                    const minValue = sortedValues.reduce((min, val) => val.lt(min) ? val : min, sortedValues[0]);
                    const sumValue = sortedValues.reduce((sum, val) => sum.plus(val), new Big(0));
                    const avgValue = sumValue.div(sortedValues.length);

                    // Créer nom de série unique pour double IPE
                    const seriesName = viewModeConfig === "ipe" && isDoubleIPEEnabled && pointsByMetricType.size > 1
                        ? `${assetInfo.name} (${metricType})`
                        : assetInfo.name;

                    // Créer les objets de données avec unité
                    processedAssets.push({
                        name: seriesName,
                        assetId: assetInfo.id,
                        timestamps: sortedTimestamps,
                        values: sortedValues,
                        metricType,
                        energyType: energyTypeConfig,
                        unit: assetUnit
                    });

                    processedStats.push({
                        name: seriesName,
                        assetId: assetInfo.id,
                        currentValue,
                        maxValue,
                        minValue,
                        avgValue,
                        sumValue
                    });

                    debug(`✅ Série ${seriesName} traitée avec succès:`, {
                        metricType,
                        unit: assetUnit,
                        dataPoints: sortedValues.length,
                        currentValue: currentValue.toString(),
                        avgValue: avgValue.toString()
                    });
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
                        <div className="tw-font-medium tw-text-purple-600">🔍 Debug Features:</div>
                        <div className="tw-ml-4 tw-text-xs">
                            <div>FeatureList Status: {featureList?.status || "undefined"}</div>
                            <div>FeatureList Items: {featureList?.items?.length || 0}</div>
                            <div>FeatureNameAttr: {featureNameAttr ? "✅" : "❌"}</div>
                            {featureList?.status === ValueStatus.Available && featureNameAttr && (
                                <div>Features détectées: {[
                                    ...(featureList.items || [])
                                        .map(item => featureNameAttr.get(item)?.value)
                                        .filter((value): value is string => !!value)
                                ].join(", ") || "Aucune"}</div>
                            )}
                        </div>
                    </div>
                    <div className="tw-font-medium tw-text-blue-600">📊 Données:</div>
                    <div className="tw-ml-4">
                        <div>Unités IPE résolues: {smartIPEUnits.ipe1Unit} / {smartIPEUnits.ipe2Unit}</div>
                        <div>Support Double IPE: {hasDoubleIPESupport ? "✅ Détecté" : "❌ Absent"}</div>
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
                showDoubleIPEToggle={isDoubleIPEEnabled && viewModeConfig === "ipe" && hasDoubleIPESupport}
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