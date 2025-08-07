import { createElement, useEffect, useState, useMemo, Fragment } from "react";
import Big from "big.js";
import { ValueStatus } from "mendix";
import { Inbox } from "lucide-react";
import { DetailswidgetContainerProps } from "../typings/DetailswidgetProps";
import { energyConfigs, shouldDisplayVariable, getMetricTypeFromName } from "./utils/energy";
import { IPECard } from "./components/IPECard";
import { ChartContainer } from "./components/ChartContainer";
import { getAutoGranularity } from "./lib/utils";
import { useFeatures, useAutoDetectedIPENames, useAutoDetectedCardUnits } from "./hooks/use-features";
import { debug } from "./utils/debugLogger";



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

// 🎯 Composant de fallback intelligent pour les cas sans IPE
const IPEFallbackMessage = ({ 
    fallbackReason, 
    ipeCount, 
    recommendedMode 
}: { 
    fallbackReason: string; 
    ipeCount: number; 
    recommendedMode: string; 
}) => (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 tw-text-center tw-min-h-[200px]">
        <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg tw-p-6 tw-max-w-md">
            <div className="tw-text-amber-800 tw-text-lg tw-font-semibold tw-mb-2">
                Mode IPE non disponible
            </div>
            <div className="tw-text-amber-600 tw-text-sm tw-mb-4">
                Cet asset ne possède pas de données IPE ({ipeCount} IPE disponible{ipeCount > 1 ? 's' : ''}).
            </div>
            <div className="tw-text-amber-500 tw-text-xs tw-mb-4">
                {fallbackReason}
            </div>
                    <div className="tw-bg-amber-100 tw-border tw-border-amber-300 tw-rounded tw-p-3">
            <div className="tw-text-amber-700 tw-text-xs tw-font-medium">
                💡 Recommandation : {recommendedMode === "fallback" 
                    ? "Utilisez le mode \"Énergétique\" pour afficher les données de consommation."
                    : recommendedMode === "single" 
                    ? "Utilisez le mode IPE simple pour afficher les données disponibles."
                    : "Mode double IPE recommandé pour une vue complète."
                }
            </div>
        </div>
        </div>
    </div>
);

export function Detailswidget(props: DetailswidgetContainerProps): JSX.Element | null {
    // Log de montage du composant
    useEffect(() => {
        debug("Detailswidget :: mount", { 
            viewMode: props.viewMode, 
            energyType: props.energyType,
            devMode: props.devMode,
            isDevEnvironment: process.env.NODE_ENV === "development"
        });
        
        // Log des paramètres de datasource pour debug
        debug("Datasource Parameters", {
            startDate: props.startDate?.value,
            endDate: props.endDate?.value,
            startDate2: props.startDate2?.value,
            endDate2: props.endDate2?.value,
            // Log des attributs mappés
            hasTimestampAttr: !!props.timestampAttr,
            hasConsumptionAttr: !!props.consumptionAttr,
            hasNameAttr: !!props.NameAttr,
            hasTimestampAttr2: !!props.timestampAttr2,
            hasConsumptionAttr2: !!props.consumptionAttr2,
            hasNameAttr2: !!props.NameAttr2,
            // Log des datasources
            hasConsumptionDataSource: !!props.consumptionDataSource,
            hasConsumptionDataSource2: !!props.consumptionDataSource2
        });
        
        return () => debug("Detailswidget :: unmount");
    }, [props.viewMode, props.energyType, props.devMode, props.startDate, props.endDate, props.startDate2, props.endDate2]);

    const {
        devMode,
        viewMode,
        energyType,
        // IPE 1 (principal)
        consumptionDataSource,
        timestampAttr,
        consumptionAttr,
        NameAttr,
        metricTypeAttr,
        startDate,
        endDate,
        card1Title,
        card1Icon,
        card1Unit,
        card1DataSource,
        card1ValueAttr,
        card2Title,
        card2Icon,
        card2Unit,
        card2DataSource,
        card2ValueAttr,
        card3Title,
        card3Icon,
        card3Unit,
        card3DataSource,
        card3ValueAttr,
        // IPE 2 (secondaire)
        consumptionDataSource2,
        timestampAttr2,
        consumptionAttr2,
        NameAttr2,
        metricTypeAttr2,
        startDate2,
        endDate2,
        card1Title2,
        card1Icon2,
        card1Unit2,
        card1DataSource2,
        card1ValueAttr2,
        card2Title2,
        card2Icon2,
        card2Unit2,
        card2DataSource2,
        card2ValueAttr2,
        card3Title2,
        card3Icon2,
        card3Unit2,
        card3DataSource2,
        card3ValueAttr2,
        // Variables de l'asset
        assetVariablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr,
        // Granularité (Lecture)
        displayModeAttr,
        displayPreviewOKAttr,
        displayTimeAttr,
        displayUnitAttr,
        // Granularité (Écriture)
        bufferModeAttr,
        bufferTimeAttr,
        bufferUnitAttr,
        onModeChange,
        onTimeChange,
        // Feature toggles
        featureList,
        featureNameAttr
    } = props;

    // État pour gérer quel IPE est actif en mode double
    const [activeIPE, setActiveIPE] = useState<1 | 2>(1);

    // États pour les données des deux IPE
    const [data1, setData1] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined; metricType?: string }>>([]);
    const [data2, setData2] = useState<Array<{ timestamp: Date; value: Big; name: string | undefined; metricType?: string }>>([]);
    
    // États pour les cartes des deux IPE
    const [card1Data1, setCard1Data1] = useState<Big | undefined>(undefined);
    const [card2Data1, setCard2Data1] = useState<Big | undefined>(undefined);
    const [card3Data1, setCard3Data1] = useState<Big | undefined>(undefined);
    const [card1Data2, setCard1Data2] = useState<Big | undefined>(undefined);
    const [card2Data2, setCard2Data2] = useState<Big | undefined>(undefined);
    const [card3Data2, setCard3Data2] = useState<Big | undefined>(undefined);
    
    const [isDataReady, setIsDataReady] = useState(false);

            // -------- Feature Toggle Logic --------
        const {
            hasIPE1Data,
            hasIPE2Data,
            isDoubleIPEActive,
            allowManualGranularity,
            // 🔄 Nouveaux champs de fallback
            fallbackMode,
            fallbackReason,
            canDisplayData,
            // 🎯 Nouveaux champs pour la détection IPE
            ipeCount,
            recommendedMode,
            shouldShowConsumptionFallback
        } = useFeatures({
            featureList,
            featureNameAttr,
            consumptionDataSource,
            consumptionDataSource2,
            timestampAttr,
            timestampAttr2,
            consumptionAttr,
            consumptionAttr2
        });

        // 🎯 Auto-détection des noms d'IPE
        const { ipe1Name: autoDetectedIPE1Name, ipe2Name: autoDetectedIPE2Name } = useAutoDetectedIPENames(
            consumptionDataSource,
            consumptionDataSource2,
            NameAttr,
            NameAttr2,
            hasIPE1Data,
            hasIPE2Data
        );

        // 🎯 Auto-détection des unités des cartes
        const {
            card1Unit: autoDetectedCard1Unit,
            card2Unit: autoDetectedCard2Unit,
            card3Unit: autoDetectedCard3Unit
        } = useAutoDetectedCardUnits(
            energyType,
            viewMode,
            // Variables de l'asset pour détecter les unités automatiquement
            assetVariablesDataSource,
            variableNameAttr,
            variableUnitAttr,
            variableMetricTypeAttr,
            variableEnergyTypeAttr,
            // Unités manuelles (priorité si définies)
            card1Unit,
            card2Unit,
            card3Unit,
            card1Unit2,
            card2Unit2,
            card3Unit2
        );

    // Logs des features et toggle
    useEffect(() => {
        debug("Features / Toggle", { isDoubleIPEActive, activeIPE });
    }, [isDoubleIPEActive, activeIPE]);

    const energyConfig = viewMode === "ipe" ? energyConfigs.IPE : energyConfigs[energyType];
    const baseEnergyConfig = energyConfigs[energyType];

    // -------- Granularité --------
    // Lecture directe depuis les props du contexte
    const displayedMode = displayModeAttr?.value ?? "Auto";
    const displayedTime = displayTimeAttr?.value?.toNumber() ?? 5;
    const displayedUnit = displayUnitAttr?.value ?? "minute";
    const isPreviewOK = displayPreviewOKAttr?.value ?? true;

    const unitMappingToMendix: Record<string, string> = {
        second: "second",
        minute: "minute",
        hour: "hour",
        day: "day",
        week: "week",
        month: "month",
        year: "year"
    };

    const handleGranularityModeChange = (newMode: "Auto" | "Strict") => {
        if (bufferModeAttr?.readOnly === false) {
            bufferModeAttr.setValue(newMode);
            if (onModeChange?.canExecute) {
                onModeChange.execute();
            }
        }
    };

    const handleGranularityValueChange = (val: number) => {
        if (bufferTimeAttr?.readOnly === false) {
            bufferTimeAttr.setValue(new Big(val));
            if (onTimeChange?.canExecute) {
                onTimeChange.execute();
            }
        }
    };

    const handleGranularityUnitChange = (uiUnit: string) => {
        const mendixValue = unitMappingToMendix[uiUnit] ?? "minute";
        if (bufferUnitAttr?.readOnly === false) {
            bufferUnitAttr.setValue(mendixValue);
            if (onTimeChange?.canExecute) {
                onTimeChange.execute();
            }
        }
    };

    // Le bouton Granularité est visible dès qu'on sait quel mode est affiché.
    // La possibilité de l'ouvrir dépendra de `allowManualGranularity`.
    const hasGranularityConfig = !!displayModeAttr;

    const uiGranularityMode = displayedMode.toLowerCase() as "auto" | "strict";
    const uiGranularityUnit = (displayedUnit => {
        if (displayedUnit === "quarter") return "month";
        return displayedUnit as "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
    })(displayedUnit);
    
    // Granularité désactivée si pas de permission ou preview non OK
    const granularityDisabled = !allowManualGranularity || !isPreviewOK;

    // -------- Toast Info --------
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isPreviewOK && uiGranularityMode === "strict") {
            const message = `Granularité ajustée automatiquement – vérifiez vos paramètres`;
            setToastMessage(message);
            const t = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(t);
        }
    }, [isPreviewOK, uiGranularityMode]);

    // 🔄 Fonctions pour obtenir les propriétés de l'IPE actuel avec gestion des fallbacks
    const getCurrentIPEProps = () => {
        // Cas 1 : Mode double IPE actif et IPE 2 sélectionné
        if (isDoubleIPEActive && activeIPE === 2 && hasIPE2Data) {
            debug("🔄 Utilisation IPE 2", { activeIPE, hasIPE2Data });
            return {
                consumptionDataSource: consumptionDataSource2,
                timestampAttr: timestampAttr2,
                consumptionAttr: consumptionAttr2,
                NameAttr: NameAttr2,
                metricTypeAttr: metricTypeAttr2,
                startDate: startDate2,
                endDate: endDate2,
                card1Title: card1Title2,
                card1Icon: card1Icon2,
                card1DataSource: card1DataSource2,
                card1ValueAttr: card1ValueAttr2,
                card2Title: card2Title2,
                card2Icon: card2Icon2,
                card2DataSource: card2DataSource2,
                card2ValueAttr: card2ValueAttr2,
                card3Title: card3Title2,
                card3Icon: card3Icon2,
                card3DataSource: card3DataSource2,
                card3ValueAttr: card3ValueAttr2,
                data: data2,
                card1Data: card1Data2,
                card2Data: card2Data2,
                card3Data: card3Data2
            };
        }
        
        // Cas 2 : Mode double IPE actif mais IPE 1 sélectionné OU seul IPE 1 disponible
        if (isDoubleIPEActive && activeIPE === 1 && hasIPE1Data) {
            debug("🔄 Utilisation IPE 1 (mode double)", { activeIPE, hasIPE1Data });
            return {
                consumptionDataSource,
                timestampAttr,
                consumptionAttr,
                NameAttr,
                metricTypeAttr,
                startDate,
                endDate,
                card1Title,
                card1Icon,
                card1Unit: autoDetectedCard1Unit,
                card1DataSource,
                card1ValueAttr,
                card2Title,
                card2Icon,
                card2Unit: autoDetectedCard2Unit,
                card2DataSource,
                card2ValueAttr,
                card3Title,
                card3Icon,
                card3Unit: autoDetectedCard3Unit,
                card3DataSource,
                card3ValueAttr,
                data: data1,
                card1Data: card1Data1,
                card2Data: card2Data1,
                card3Data: card3Data1
            };
        }
        
        // Cas 3 : Mode simple IPE (fallback automatique)
        if (hasIPE1Data) {
            debug("🔄 Utilisation IPE 1 (mode simple)", { hasIPE1Data, fallbackMode });
            return {
                consumptionDataSource,
                timestampAttr,
                consumptionAttr,
                NameAttr,
                metricTypeAttr,
                startDate,
                endDate,
                card1Title,
                card1Icon,
                card1Unit: autoDetectedCard1Unit,
                card1DataSource,
                card1ValueAttr,
                card2Title,
                card2Icon,
                card2Unit: autoDetectedCard2Unit,
                card2DataSource,
                card2ValueAttr,
                card3Title,
                card3Icon,
                card3Unit: autoDetectedCard3Unit,
                card3DataSource,
                card3ValueAttr,
                data: data1,
                card1Data: card1Data1,
                card2Data: card2Data1,
                card3Data: card3Data1
            };
        }
        
        // Cas 4 : Seul IPE 2 disponible (cas rare)
        if (hasIPE2Data) {
            debug("🔄 Utilisation IPE 2 (seul disponible)", { hasIPE2Data, fallbackMode });
            return {
                consumptionDataSource: consumptionDataSource2,
                timestampAttr: timestampAttr2,
                consumptionAttr: consumptionAttr2,
                NameAttr: NameAttr2,
                metricTypeAttr: metricTypeAttr2,
                startDate: startDate2,
                endDate: endDate2,
                card1Title: card1Title2,
                card1Icon: card1Icon2,
                card1DataSource: card1DataSource2,
                card1ValueAttr: card1ValueAttr2,
                card2Title: card2Title2,
                card2Icon: card2Icon2,
                card2DataSource: card2DataSource2,
                card2ValueAttr: card2ValueAttr2,
                card3Title: card3Title2,
                card3Icon: card3Icon2,
                card3DataSource: card3DataSource2,
                card3ValueAttr: card3ValueAttr2,
                data: data2,
                card1Data: card1Data2,
                card2Data: card2Data2,
                card3Data: card3Data2
            };
        }
        
        // Cas 5 : Aucune donnée disponible (ne devrait jamais arriver ici)
        debug("❌ Aucune donnée IPE disponible", { fallbackMode, fallbackReason });
        return {
            consumptionDataSource,
            timestampAttr,
            consumptionAttr,
            NameAttr,
            metricTypeAttr,
            startDate,
            endDate,
            card1Title,
            card1Icon,
            card1DataSource,
            card1ValueAttr,
            card2Title,
            card2Icon,
            card2DataSource,
            card2ValueAttr,
            card3Title,
            card3Icon,
            card3DataSource,
            card3ValueAttr,
            data: [],
            card1Data: undefined,
            card2Data: undefined,
            card3Data: undefined
        };
    };

    const currentProps = getCurrentIPEProps();

    const isConsumptionDataReady1 = consumptionDataSource?.status === ValueStatus.Available;
    const isConsumptionDataReady2 = consumptionDataSource2?.status === ValueStatus.Available;

    // Logs des datasources
    useEffect(() => {
        if (isConsumptionDataReady1)
            debug("DS-IPE1 Available", { 
                items: consumptionDataSource?.items?.length,
                hasTimestampAttr: !!timestampAttr,
                hasConsumptionAttr: !!consumptionAttr,
                hasNameAttr: !!NameAttr,
                firstItem: consumptionDataSource?.items?.[0] ? {
                    id: consumptionDataSource.items[0].id,
                    hasTimestamp: timestampAttr ? !!timestampAttr.get(consumptionDataSource.items[0]).value : false,
                    hasConsumption: consumptionAttr ? !!consumptionAttr.get(consumptionDataSource.items[0]).value : false,
                    hasName: NameAttr ? !!NameAttr.get(consumptionDataSource.items[0]).value : false
                } : null
            });
    }, [isConsumptionDataReady1, consumptionDataSource?.items?.length, devMode, timestampAttr, consumptionAttr, NameAttr]);

    useEffect(() => {
        if (isConsumptionDataReady2)
            debug("DS-IPE2 Available", { 
                items: consumptionDataSource2?.items?.length
            });
    }, [isConsumptionDataReady2, consumptionDataSource2?.items?.length, devMode]);
    const isCard1DataReady1 = card1DataSource?.status === ValueStatus.Available;
    const isCard2DataReady1 = card2DataSource?.status === ValueStatus.Available;
    const isCard3DataReady1 = card3DataSource?.status === ValueStatus.Available;
    const isCard1DataReady2 = card1DataSource2?.status === ValueStatus.Available;
    const isCard2DataReady2 = card2DataSource2?.status === ValueStatus.Available;
    const isCard3DataReady2 = card3DataSource2?.status === ValueStatus.Available;



    // Mode développement - pas de données simulées pour des tests réalistes
    useEffect(() => {
        if (devMode) {
            debug("Mode dev activé - pas de données simulées pour des tests réalistes");
        }
    }, [devMode]);

    // Chargement des données principales IPE 1
    useEffect(() => {
        debug("Conditions parsing IPE 1", {
            devMode: devMode,
            isConsumptionDataReady1: isConsumptionDataReady1,
            hasTimestampAttr: !!timestampAttr,
            hasConsumptionAttr: !!consumptionAttr,
            viewMode: viewMode,
            shouldParse: !devMode && isConsumptionDataReady1 && timestampAttr && consumptionAttr
        });
        
        if (
            (devMode || isConsumptionDataReady1) &&
            (devMode || (timestampAttr && consumptionAttr))
        ) {
            const itemsRaw = consumptionDataSource?.items ?? [];
            
            // 🔍 DEBUG DÉTAILLÉ des 5 premiers items
            debug("🔍 Analyse détaillée des premiers items", {
                totalItems: itemsRaw.length,
                first5Items: itemsRaw.slice(0, 5).map((item, index) => {
                    const timestamp = timestampAttr ? timestampAttr.get(item).value : null;
                    const consumption = consumptionAttr ? consumptionAttr.get(item).value : null;
                    const name = NameAttr ? NameAttr.get(item).value : null;
                    const metricType = metricTypeAttr ? metricTypeAttr.get(item).value : null;
                    
                    return {
                        index,
                        timestamp,
                        consumption,
                        name,
                        metricType,
                        metricTypeType: typeof metricType,
                        metricTypeIsNull: metricType === null,
                        metricTypeIsUndefined: metricType === undefined
                    };
                })
            });
            
            const items = itemsRaw
                .map((item, originalIndex) => {
                    if (!timestampAttr || !consumptionAttr) return null;
                    
                    const timestamp = timestampAttr.get(item).value;
                    const value = consumptionAttr.get(item).value;
                    const nameValue = NameAttr ? NameAttr.get(item).value : undefined;
                    const metricTypeValue = metricTypeAttr ? metricTypeAttr.get(item).value : undefined;

                    // 🔍 DEBUG : Log pour les 5 premiers items
                    if (originalIndex < 5) {
                        debug(`🔍 Item ${originalIndex} détails`, {
                            timestamp,
                            value,
                            nameValue,
                            metricTypeValue,
                            metricTypeFromAttr: metricTypeValue,
                            metricTypeFromName: getMetricTypeFromName(nameValue)
                        });
                    }

                    if (timestamp != null && value != null) {
                        // Déterminer le type de métrique à partir de l'attribut ou du nom
                        const finalMetricType = metricTypeValue || getMetricTypeFromName(nameValue);
                        
                        // 🔍 DEBUG : Test de filtrage
                        if (originalIndex < 5) {
                            debug(`🔍 Test filtrage item ${originalIndex}`, {
                                finalMetricType,
                                viewMode,
                                beforeFilter: { nameValue, metricTypeValue, finalMetricType }
                            });
                        }
                        
                        // Vérifier si cette variable doit être affichée dans le mode actuel
                        const shouldDisplay = shouldDisplayVariable(finalMetricType, viewMode);
                        
                        if (!shouldDisplay) {
                            if (originalIndex < 5) {
                                debug(`❌ Item ${originalIndex} rejeté par filtrage`);
                            }
                            return null;
                        }

                        if (originalIndex < 5) {
                            debug(`✅ Item ${originalIndex} accepté`);
                        }

                        return {
                            timestamp: new Date(timestamp),
                            value: new Big(value.toString()),
                            name: nameValue as string | undefined,
                            metricType: finalMetricType
                        };
                    }
                    return null;
                })
                .filter((item): item is NonNullable<typeof item> => item !== null);

            const sortedItems = items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setData1(sortedItems);
            
            debug("Data1 parsed - DÉTAILLÉ", {
                count: sortedItems.length,
                itemsRawCount: itemsRaw.length,
                itemsFilteredCount: items.length,
                first: sortedItems[0],
                last: sortedItems[sortedItems.length - 1],
                itemsRejetés: itemsRaw.length - items.length,
                viewMode: viewMode,
                metricTypes: sortedItems.map(item => item.metricType),
                // 🔍 ANALYSE des rejets
                analysisRejects: {
                    totalRaw: itemsRaw.length,
                    afterValidation: items.length,
                    afterFilter: sortedItems.length,
                    rejectedByValidation: itemsRaw.length - items.length,
                    rejectedByFilter: items.length - sortedItems.length
                }
            });
        }
    }, [devMode, isConsumptionDataReady1, timestampAttr, consumptionAttr, NameAttr, consumptionDataSource, metricTypeAttr, viewMode]);

    // Chargement des données principales IPE 2
    useEffect(() => {
        // Debug log pour voir pourquoi le parsing ne se déclenche pas
        debug("Conditions parsing IPE 2", {
            devMode: devMode,
            isDoubleIPEActive: isDoubleIPEActive,
            isConsumptionDataReady2: isConsumptionDataReady2,
            hasTimestampAttr2: !!timestampAttr2,
            hasConsumptionAttr2: !!consumptionAttr2,
            shouldParse: !devMode && isDoubleIPEActive && isConsumptionDataReady2 && timestampAttr2 && consumptionAttr2
        });
        
        if (
            !devMode &&
            isDoubleIPEActive &&
            isConsumptionDataReady2 &&
            timestampAttr2 &&
            consumptionAttr2
        ) {
            const itemsRaw = consumptionDataSource2?.items ?? [];
            const items = itemsRaw
                .map(item => {
                    const timestamp = timestampAttr2.get(item).value;
                    const value = consumptionAttr2.get(item).value;
                    const nameValue = NameAttr2 ? NameAttr2.get(item).value : undefined;
                    const metricTypeValue = metricTypeAttr2 ? metricTypeAttr2.get(item).value : undefined;

                    if (timestamp != null && value != null) {
                        // Déterminer le type de métrique à partir de l'attribut ou du nom
                        const finalMetricType = metricTypeValue || getMetricTypeFromName(nameValue);
                        
                        // Vérifier si cette variable doit être affichée dans le mode actuel
                        if (!shouldDisplayVariable(finalMetricType, viewMode)) {
                            return null;
                        }

                        return {
                            timestamp: new Date(timestamp),
                            value: new Big(value.toString()),
                            name: nameValue as string | undefined,
                            metricType: finalMetricType
                        };
                    }
                    return null;
                })
                .filter((item): item is NonNullable<typeof item> => item !== null);

            const sortedItems = items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setData2(sortedItems);
            debug("Data2 parsed", {
                count: sortedItems.length,
                first: sortedItems[0],
                last: sortedItems[sortedItems.length - 1],
                viewMode: viewMode,
                metricTypes: sortedItems.map(item => item.metricType)
            });
        }
    }, [devMode, isDoubleIPEActive, isConsumptionDataReady2, timestampAttr2, consumptionAttr2, NameAttr2, consumptionDataSource2]);

    // Chargement des données des cartes IPE 1
    useEffect(() => {
        // Debug log pour les cartes IPE 1
        debug("Conditions cartes IPE 1", {
            devMode: devMode,
            viewMode: viewMode,
            hasCard1DataSource: !!card1DataSource,
            isCard1DataReady1: isCard1DataReady1,
            hasCard1ValueAttr: !!card1ValueAttr,
            shouldParse: !devMode && (viewMode === "ipe" || card1DataSource) && isCard1DataReady1 && card1ValueAttr
        });
        
        if (
            !devMode &&
            (viewMode === "ipe" || card1DataSource) &&
            isCard1DataReady1 &&
            card1ValueAttr
        ) {
            const first = card1DataSource?.items?.[0];
            if (first) {
                const value = card1ValueAttr.get(first);
                if (value?.value != null) setCard1Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard1DataReady1, card1ValueAttr, card1DataSource]);

    useEffect(() => {
        if (
            !devMode &&
            (viewMode === "ipe" || card2DataSource) &&
            isCard2DataReady1 &&
            card2ValueAttr
        ) {
            const first = card2DataSource?.items?.[0];
            if (first) {
                const value = card2ValueAttr.get(first);
                if (value?.value != null) setCard2Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard2DataReady1, card2ValueAttr, card2DataSource]);

    useEffect(() => {
        if (
            !devMode &&
            (viewMode === "ipe" || card3DataSource) &&
            isCard3DataReady1 &&
            card3ValueAttr
        ) {
            const first = card3DataSource?.items?.[0];
            if (first) {
                const value = card3ValueAttr.get(first);
                if (value?.value != null) setCard3Data1(new Big(value.value.toString()));
            }
        }
    }, [devMode, viewMode, isCard3DataReady1, card3ValueAttr, card3DataSource]);

    // Chargement des données des cartes IPE 2
    useEffect(() => {
        if (
            !devMode &&
            isDoubleIPEActive &&
            (viewMode === "ipe" || card1DataSource2) &&
            isCard1DataReady2 &&
            card1ValueAttr2
        ) {
            const first = card1DataSource2?.items?.[0];
            if (first) {
                const value = card1ValueAttr2.get(first);
                if (value?.value != null) setCard1Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, isDoubleIPEActive, viewMode, isCard1DataReady2, card1ValueAttr2, card1DataSource2]);

    useEffect(() => {
        if (
            !devMode &&
            isDoubleIPEActive &&
            (viewMode === "ipe" || card2DataSource2) &&
            isCard2DataReady2 &&
            card2ValueAttr2
        ) {
            const first = card2DataSource2?.items?.[0];
            if (first) {
                const value = card2ValueAttr2.get(first);
                if (value?.value != null) setCard2Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, isDoubleIPEActive, viewMode, isCard2DataReady2, card2ValueAttr2, card2DataSource2]);

    useEffect(() => {
        if (
            !devMode &&
            isDoubleIPEActive &&
            (viewMode === "ipe" || card3DataSource2) &&
            isCard3DataReady2 &&
            card3ValueAttr2
        ) {
            const first = card3DataSource2?.items?.[0];
            if (first) {
                const value = card3ValueAttr2.get(first);
                if (value?.value != null) setCard3Data2(new Big(value.value.toString()));
            }
        }
    }, [devMode, isDoubleIPEActive, viewMode, isCard3DataReady2, card3ValueAttr2, card3DataSource2]);

    // État global prêt - renforcé avec vérification des données non vides
    useEffect(() => {
        const mainReady1 = devMode || (isConsumptionDataReady1 && data1.length > 0);
        const mainReady2 = !isDoubleIPEActive || devMode || (isConsumptionDataReady2 && data2.length > 0);
        
        const cardsReady1 =
            viewMode !== "ipe" ||
            ((card1Data1 !== undefined || !card1DataSource || devMode) &&
                (card2Data1 !== undefined || !card2DataSource || devMode) &&
                (card3Data1 !== undefined || !card3DataSource || devMode));
                
        const cardsReady2 =
            !isDoubleIPEActive ||
            viewMode !== "ipe" ||
            ((card1Data2 !== undefined || !card1DataSource2 || devMode) &&
                (card2Data2 !== undefined || !card2DataSource2 || devMode) &&
                (card3Data2 !== undefined || !card3DataSource2 || devMode));
                
        const newDataReady = mainReady1 && mainReady2 && cardsReady1 && cardsReady2;
        setIsDataReady(newDataReady);
        
        if (newDataReady !== isDataReady) {
            debug("isDataReady ⇢", newDataReady);
        }
    }, [
        devMode, viewMode, isDoubleIPEActive,
        isConsumptionDataReady1, isConsumptionDataReady2,
        data1.length, data2.length,
        card1Data1, card2Data1, card3Data1,
        card1Data2, card2Data2, card3Data2,
        card1DataSource, card2DataSource, card3DataSource,
        card1DataSource2, card2DataSource2, card3DataSource2,
        isDataReady
    ]);

    const effectiveStartDate = currentProps.startDate?.value;
    const effectiveEndDate = currentProps.endDate?.value;

    const autoGranularity = useMemo(() => {
        if (!effectiveStartDate || !effectiveEndDate) {
            return { value: 5, unit: "minutes" };
        }
        const granularity = getAutoGranularity(effectiveStartDate, effectiveEndDate);
        const unitLabels: Record<string, string> = {
            minute: "minutes",
            hour: "heures", 
            day: "jours",
            week: "semaines",
            month: "mois",
            year: "années"
        };
        
        return {
            value: granularity.value,
            unit: granularity.value === 1 
                ? granularity.unit === "minute" ? "minute" 
                  : granularity.unit === "hour" ? "heure"
                  : granularity.unit === "day" ? "jour"
                  : granularity.unit === "week" ? "semaine"
                  : granularity.unit === "month" ? "mois"
                  : "année"
                : unitLabels[granularity.unit] || "minutes"
        };
    }, [effectiveStartDate, effectiveEndDate]);

    const filteredDataForExport = useMemo(() => {
        if (!effectiveStartDate || !effectiveEndDate) return currentProps.data;
        
        const filtered = currentProps.data.filter(item => {
            const d = new Date(item.timestamp);
            return d >= new Date(effectiveStartDate) && d <= new Date(effectiveEndDate);
        });
        
        // Debug log pour identifier le problème de filtrage
        debug("Filtrage par plage de dates", {
            avant: currentProps.data.length,
            après: filtered.length,
            startDate: effectiveStartDate,
            endDate: effectiveEndDate,
            startDateISO: effectiveStartDate ? new Date(effectiveStartDate).toISOString() : null,
            endDateISO: effectiveEndDate ? new Date(effectiveEndDate).toISOString() : null,
            premierPoint: currentProps.data[0] ? new Date(currentProps.data[0].timestamp).toISOString() : null,
            dernierPoint: currentProps.data[currentProps.data.length - 1] ? new Date(currentProps.data[currentProps.data.length - 1].timestamp).toISOString() : null
        });
        
        return filtered;
    }, [currentProps.data, effectiveStartDate, effectiveEndDate]);

    const exportData = filteredDataForExport.map(item => ({
        timestamp: item.timestamp,
        value: item.value.toNumber(),
        name: item.name
    }));

    const baseFilename = `consommation_${energyType}`;
    const dateRangeString = `_${
        effectiveStartDate ? new Date(effectiveStartDate).toISOString().split("T")[0] : ""
    }_${
        effectiveEndDate ? new Date(effectiveEndDate).toISOString().split("T")[0] : ""
    }`;

    if (!isDataReady) {
        return null; // Encore en cours de chargement
    }

    // Vérifier si on a des données à afficher
    const hasData = currentProps.data.length > 0;
    
    // Debug log pour l'état des données
    debug("État des données avant affichage", {
        dataLength: currentProps.data.length,
        hasData: hasData,
        effectiveStartDate: effectiveStartDate,
        effectiveEndDate: effectiveEndDate,
        isDataReady: isDataReady,
        viewMode: viewMode,
        energyType: energyType,
        premierPoint: currentProps.data[0] ? {
            timestamp: currentProps.data[0].timestamp,
            value: currentProps.data[0].value.toString(),
            name: currentProps.data[0].name
        } : null
    });

    const ipeCards = (
        <div className="tw-flex tw-flex-row tw-gap-6 tw-h-full">
            {(currentProps.card1DataSource || devMode || currentProps.card1Title) && (
                <IPECard
                    icon={currentProps.card1Icon}
                    title={currentProps.card1Title || "Consommation"}
                    value={currentProps.card1Data}
                    unit={currentProps.card1Unit || "kWh"}
                    color={energyConfig.color}
                    type={
                        energyType === "gas"
                            ? "gaz"
                            : energyType === "water"
                            ? "eau"
                            : energyType === "air"
                            ? "air"
                            : "elec"
                    }
                />
            )}
            {(currentProps.card2DataSource || devMode || currentProps.card2Title) && (
                <IPECard
                    icon={currentProps.card2Icon}
                    title={currentProps.card2Title || "Production"}
                    value={currentProps.card2Data}
                    unit={currentProps.card2Unit || "kWh"}
                    color={energyConfig.color}
                    type="production"
                />
            )}
            {(currentProps.card3DataSource || devMode || currentProps.card3Title) && (
                <IPECard
                    icon={currentProps.card3Icon}
                    title={currentProps.card3Title || "IPE"}
                    value={currentProps.card3Data}
                    unit={currentProps.card3Unit || "%"}
                    color={energyConfig.color}
                    type="ipe"
                />
            )}
        </div>
    );

    // Toast overlay simple
    const toastOverlay = toastMessage ? (
        <div className="tw-fixed tw-top-5 tw-right-5 tw-bg-gray-900 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-shadow-lg tw-z-50 tw-opacity-90">
            {toastMessage}
        </div>
    ) : null;

    if (viewMode === "energetic") {
        return (
            <Fragment>
                {toastOverlay}
                <ChartContainer
                    data={hasData ? exportData : []}
                    energyConfig={energyConfig}
                    startDate={effectiveStartDate}
                    endDate={effectiveEndDate}
                    filename={`${baseFilename}${dateRangeString}`}
                    showLineChart={hasData}
                    showHeatMap={hasData}
                    showExportButton={hasData}
                    title={`Consommation ${energyConfig.label.toLowerCase()}`}
                    noDataContent={!hasData ? <NoDataMessage /> : undefined}
                    showGranularityControl={hasGranularityConfig && allowManualGranularity}
                    showSimpleGranularity={hasGranularityConfig && !allowManualGranularity}
                    granularityMode={uiGranularityMode}
                    granularityValue={displayedTime}
                    granularityUnit={uiGranularityUnit}
                    onGranularityModeChange={handleGranularityModeChange}
                    onGranularityValueChange={handleGranularityValueChange}
                    onGranularityUnitChange={handleGranularityUnitChange}
                    autoGranularity={autoGranularity}
                    isGranularityDisabled={granularityDisabled}
                />
            </Fragment>
        );
    }

    if (viewMode === "ipe") {
        // 🎯 Fallback intelligent vers mode consommation si pas d'IPE
        if (shouldShowConsumptionFallback) {
            debug("🔄 Mode IPE : Fallback vers consommation", { 
                ipeCount,
                recommendedMode,
                shouldShowConsumptionFallback,
                fallbackReason
            });
            
            // Afficher un message informatif avec recommandation
            return (
                <IPEFallbackMessage 
                    fallbackReason={fallbackReason}
                    ipeCount={ipeCount}
                    recommendedMode={recommendedMode}
                />
            );
        }
        
        // 🔄 Gestion des cas de fallback améliorée pour les IPE partiels
        if (!canDisplayData) {
            debug("❌ Mode IPE : Aucune donnée disponible", { 
                fallbackMode, 
                fallbackReason,
                hasIPE1Data,
                hasIPE2Data,
                isDoubleIPEActive
            });
            return (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 tw-text-center tw-min-h-[200px]">
                    <Inbox className="tw-h-16 tw-w-16 tw-text-gray-400 tw-mb-4" />
                    <div className="tw-text-gray-500 tw-text-xl tw-mb-2">
                        Aucune donnée IPE disponible
                    </div>
                    <div className="tw-text-gray-400 tw-text-base">
                        {fallbackReason}
                    </div>
                </div>
            );
        }
        
        // 🔄 Log de debug pour les cas de fallback
        if (fallbackMode !== "none") {
            debug("🔄 Mode IPE : Fallback actif", { 
                fallbackMode, 
                fallbackReason,
                isDoubleIPEActive,
                activeIPE
            });
        }
        
        const ipeConfig = {
            ...energyConfigs.IPE,
            unit: currentProps.card3Unit || baseEnergyConfig.ipeUnit,
            label: energyConfigs.IPE.label || "IPE"
        };
        
        const titleSuffix = isDoubleIPEActive ? ` - ${activeIPE === 1 ? autoDetectedIPE1Name : autoDetectedIPE2Name}` : "";
        
        return (
            <Fragment>
                {toastOverlay}
                <ChartContainer
                    data={hasData ? exportData : []}
                    energyConfig={ipeConfig}
                    startDate={effectiveStartDate}
                    endDate={effectiveEndDate}
                    filename={`ipe_${baseFilename}${dateRangeString}`}
                    showLineChart={hasData}
                    showHeatMap={false}
                    showExportButton={hasData}
                    extraHeaderContent={ipeCards}
                    title={
                        currentProps.card3Title
                            ? `Indice de Performance Énergétique (${currentProps.card3Title})${titleSuffix}`
                            : `Indice de Performance Énergétique${titleSuffix}`
                    }
                    noDataContent={!hasData ? <NoDataMessage /> : undefined}
                    showIPEToggle={isDoubleIPEActive && hasIPE1Data && hasIPE2Data}
                    ipe1Name={autoDetectedIPE1Name}
                    ipe2Name={autoDetectedIPE2Name}
                    activeIPE={activeIPE}
                    onIPEToggle={setActiveIPE}
                    ipeToggleDisabled={!hasIPE2Data || !hasIPE1Data}
                    showGranularityControl={hasGranularityConfig && allowManualGranularity}
                    showSimpleGranularity={hasGranularityConfig && !allowManualGranularity}
                    granularityMode={uiGranularityMode}
                    granularityValue={displayedTime}
                    granularityUnit={uiGranularityUnit}
                    onGranularityModeChange={handleGranularityModeChange}
                    onGranularityValueChange={handleGranularityValueChange}
                    onGranularityUnitChange={handleGranularityUnitChange}
                    autoGranularity={autoGranularity}
                    isGranularityDisabled={granularityDisabled}
                />
            </Fragment>
        );
    }

    return (
        <Fragment>
            {toastOverlay}
            <ChartContainer
                data={hasData ? exportData : []}
                energyConfig={energyConfig}
                startDate={effectiveStartDate}
                endDate={effectiveEndDate}
                filename={`${baseFilename}_general${dateRangeString}`}
                showLineChart={hasData}
                showHeatMap={false}
                showExportButton={hasData}
                extraHeaderContent={ipeCards}
                title={`Vue Générale ${energyConfig.label.toLowerCase()}`}
                noDataContent={!hasData ? <NoDataMessage /> : undefined}
                showGranularityControl={hasGranularityConfig && allowManualGranularity}
                showSimpleGranularity={hasGranularityConfig && !allowManualGranularity}
                granularityMode={uiGranularityMode}
                granularityValue={displayedTime}
                granularityUnit={uiGranularityUnit}
                onGranularityModeChange={handleGranularityModeChange}
                onGranularityValueChange={handleGranularityValueChange}
                onGranularityUnitChange={handleGranularityUnitChange}
                autoGranularity={autoGranularity}
                isGranularityDisabled={granularityDisabled}
            />
        </Fragment>
    );
}