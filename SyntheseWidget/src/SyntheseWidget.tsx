import React, { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { SyntheseWidgetContainerProps } from "../typings/SyntheseWidgetProps";
import { CardConsoTotal } from "./components/cards/CardConsoTotal";
// ColumnChart retiré (stacked chart + tableau suffisent pour lecture rapide)
// Ancienne structure Overview supprimée
// StackedBarChart retiré de l'Overview (inutile avec cumuls) – conservé au besoin futur
import { DPEGauge } from "./components/dpe/DPEGauge";
import { DateRangeSelector } from "./components/navigation/DateRangeSelector";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { DashboardSynthese } from "./components/dashboard/DashboardSynthese";
import { LoadingService } from "./components/services/LoadingService";
import { BaseUnit } from "./utils/unitConverter";
import { AssetLevelAdapter } from "./adapters/AssetLevelAdapter";
// ByLevelTable retiré de l'Overview pour éviter redondance multi-niveaux

import "./ui/SyntheseWidget.css";
import "./styles/loader.css";
import "./styles/dialog-animations.css";

// Define the specific type for threshold keys based on the naming pattern
type OriginalThresholdKey = Extract<
    keyof SyntheseWidgetContainerProps,
    `Threshold${string}_${"Day" | "Week" | "Month"}`
>;

// Helper array defined outside the component or imported, now using the specific type
const ORIGINAL_THRESHOLD_KEYS: OriginalThresholdKey[] = [
    "ThresholdA_Day",
    "ThresholdB_Day",
    "ThresholdC_Day",
    "ThresholdD_Day",
    "ThresholdE_Day",
    "ThresholdF_Day",
    "ThresholdA_Week",
    "ThresholdB_Week",
    "ThresholdC_Week",
    "ThresholdD_Week",
    "ThresholdE_Week",
    "ThresholdF_Week",
    "ThresholdA_Month",
    "ThresholdB_Month",
    "ThresholdC_Month",
    "ThresholdD_Month",
    "ThresholdE_Month",
    "ThresholdF_Month"
];
// Helper constant defined outside the component or imported
const DEFAULT_THRESHOLDS: Record<string, number> = {
    ThresholdA_Day: 200,
    ThresholdB_Day: 400,
    ThresholdC_Day: 600,
    ThresholdD_Day: 800,
    ThresholdE_Day: 1000,
    ThresholdF_Day: 1200,
    ThresholdA_Week: 1400,
    ThresholdB_Week: 2800,
    ThresholdC_Week: 4200,
    ThresholdD_Week: 5600,
    ThresholdE_Week: 7000,
    ThresholdF_Week: 8400,
    ThresholdA_Month: 6000,
    ThresholdB_Month: 12000,
    ThresholdC_Month: 18000,
    ThresholdD_Month: 24000,
    ThresholdE_Month: 30000,
    ThresholdF_Month: 36000
};

export function SyntheseWidget(props: SyntheseWidgetContainerProps): ReactElement {
    const {
        // New unified datasources (Levels + all Assets)
        levels,
        levelName,
        levelSortOrder,
        allAssets,
        assetLevel,
        // Asset metric attributes
        attrTotalConsoElec,
        attrTotalConsoGaz,
        attrTotalConsoEau,
        attrTotalConsoAir,
        attrTotalConsoElecPeriodPrec,
        attrTotalConsoGazPeriodPrec,
        attrTotalConsoEauPeriodPrec,
        attrTotalConsoAirPeriodPrec,
        // Period actions
        onClickDay,
        onClickWeek,
        onClickMonth,
        onPeriodChange,
        refreshDataAction,
        // Units
        baseUnitElectricity,
        baseUnitGas,
        baseUnitWater,
        baseUnitAir,
        // DPE
        dsDPESettings,
        ThresholdA_Day,
        ThresholdB_Day,
        ThresholdC_Day,
        ThresholdD_Day,
        ThresholdE_Day,
        ThresholdF_Day,
        ThresholdA_Week,
        ThresholdB_Week,
        ThresholdC_Week,
        ThresholdD_Week,
        ThresholdE_Week,
        ThresholdF_Week,
        ThresholdA_Month,
        ThresholdB_Month,
        ThresholdC_Month,
        ThresholdD_Month,
        ThresholdE_Month,
        ThresholdF_Month
    } = props;
    const [usineData, setUsineData] = useState<{
        consoElec: Big;
        consoGaz: Big;
        consoEau: Big;
        consoAir: Big;
        consoElecPrec: Big;
        consoGazPrec: Big;
        consoEauPrec: Big;
        consoAirPrec: Big;
    }>({
        consoElec: new Big(0),
        consoGaz: new Big(0),
        consoEau: new Big(0),
        consoAir: new Big(0),
        consoElecPrec: new Big(0),
        consoGazPrec: new Big(0),
        consoEauPrec: new Big(0),
        consoAirPrec: new Big(0)
    });

    // Données agrégées par niveau (Overview retiré). Conservé si besoin futur.
    const [visibleLevels, setVisibleLevels] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    const [activePeriod, setActivePeriod] = useState<"day" | "week" | "month">("day");
    const [activePreset, setActivePreset] = useState<"7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom">("30d");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const unsubscribe = LoadingService.subscribe(loading => {
            setIsLoading(loading);
            if (loading) {
                setMessage(LoadingService.getMessage());
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const executeAction = (action: any, loadingMessage?: string) => {
        if (action?.canExecute) {
            LoadingService.executeAction(action, loadingMessage);
        }
    };

    useEffect(() => {
        if (allAssets?.status !== "available" || !allAssets.items) return;
        // Agrégation globale sur tous les assets
        const adapted = allAssets.items.map(item => ({
            consoTotalElec: attrTotalConsoElec.get(item).value,
            consoTotalGaz: attrTotalConsoGaz.get(item).value,
            consoTotalEau: attrTotalConsoEau.get(item).value,
            consoTotalAir: attrTotalConsoAir.get(item).value,
            consoTotalElecPrev: attrTotalConsoElecPeriodPrec.get(item).value,
            consoTotalGazPrev: attrTotalConsoGazPeriodPrec.get(item).value,
            consoTotalEauPrev: attrTotalConsoEauPeriodPrec.get(item).value,
            consoTotalAirPrev: attrTotalConsoAirPeriodPrec.get(item).value
        }));
        const agg = AssetLevelAdapter.aggregateAssets(adapted);
        const big = AssetLevelAdapter.toBigNumbers(agg);
        setUsineData(big as any);
    }, [
        allAssets,
        attrTotalConsoElec,
        attrTotalConsoGaz,
        attrTotalConsoEau,
        attrTotalConsoAir,
        attrTotalConsoElecPeriodPrec,
        attrTotalConsoGazPeriodPrec,
        attrTotalConsoEauPeriodPrec,
        attrTotalConsoAirPeriodPrec
    ]);

    useEffect(() => {
        if (levels?.status !== "available" || !levels.items) {
            setVisibleLevels([]);
            return;
        }
        const levelKey = (item: any) => levelName.get(item).value ?? "";
        const sortedLevels = [...levels.items].sort((a, b) => {
            const av = levelSortOrder?.get(a).value as any;
            const bv = levelSortOrder?.get(b).value as any;
            const ai = av instanceof Big ? av.toNumber() : typeof av === "number" ? av : 0;
            const bi = bv instanceof Big ? bv.toNumber() : typeof bv === "number" ? bv : 0;
            return ai - bi;
        });
        const names = sortedLevels.map(levelKey).filter(n => n && n.length > 0);
        if (visibleLevels.length === 0) {
            setVisibleLevels(names);
            if (!selectedLevel && names.length > 0) setSelectedLevel(names[0]);
        }
    }, [levels, levelName, levelSortOrder, visibleLevels.length, selectedLevel]);

    // toggleLevel retiré (sélection via clic sur Overview)

    // filteredSecteursData non utilisé après simplification Overview

    const handleDateRangeChange = (period: "day" | "week" | "month") => {
        setActivePeriod(period);

        const periodsMap = {
            day: "Chargement des données du jour",
            week: "Chargement des données de la semaine",
            month: "Chargement des données du mois"
        };

        const loadingMessage = periodsMap[period];

        switch (period) {
            case "day":
                if (onClickDay?.canExecute) {
                    executeAction(onClickDay, loadingMessage);
                }
                break;
            case "week":
                if (onClickWeek?.canExecute) {
                    executeAction(onClickWeek, loadingMessage);
                }
                break;
            case "month":
                if (onClickMonth?.canExecute) {
                    executeAction(onClickMonth, loadingMessage);
                }
                break;
        }

        // Enchaîner avec onPeriodChange et refreshDataAction si configurés
        if (onPeriodChange?.canExecute) {
            executeAction(onPeriodChange);
        }
        if (refreshDataAction?.canExecute) {
            executeAction(refreshDataAction, "Rafraîchissement des données…");
        }
    };

    const handlePreset = (key: "7d" | "30d" | "mtd" | "m-1" | "ytd" | "n-1" | "custom") => {
        setActivePreset(key);
        const map: Record<string, "day" | "week" | "month"> = {
            "7d": "week",
            "30d": "month",
            mtd: "month",
            "m-1": "month",
            ytd: "month",
            "n-1": "month",
            custom: "month"
        };
        handleDateRangeChange(map[key] || "day");
    };

    // Gestionnaires legacy retirés (navigation détaillée non requise pour dashboard 5s)

    // calculateDPEGrade function using useMemo
    const calculateDPEGrade = useMemo((): ((
        value: number,
        period: "day" | "week" | "month"
    ) => "A" | "B" | "C" | "D" | "E" | "F" | "G") => {
        const settingsObj =
            dsDPESettings?.status === "available" && dsDPESettings.items && dsDPESettings.items.length > 0
                ? dsDPESettings.items[0]
                : undefined;

        const currentThresholds: Record<string, number> = {};
        // Create a map of threshold props for easier access inside the loop
        // Explicitly type the map using OriginalThresholdKey and ListAttributeValue
        const thresholdProps: Record<OriginalThresholdKey, ListAttributeValue<Big>> = {
            ThresholdA_Day,
            ThresholdB_Day,
            ThresholdC_Day,
            ThresholdD_Day,
            ThresholdE_Day,
            ThresholdF_Day,
            ThresholdA_Week,
            ThresholdB_Week,
            ThresholdC_Week,
            ThresholdD_Week,
            ThresholdE_Week,
            ThresholdF_Week,
            ThresholdA_Month,
            ThresholdB_Month,
            ThresholdC_Month,
            ThresholdD_Month,
            ThresholdE_Month,
            ThresholdF_Month
        };

        if (settingsObj) {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                // Access the prop using the correctly typed key - no error expected here now
                const attr = thresholdProps[key];
                if (attr) {
                    const editableValue = attr.get(settingsObj);
                    const bigValue = editableValue?.value;
                    currentThresholds[key] = bigValue instanceof Big ? bigValue.toNumber() : DEFAULT_THRESHOLDS[key];
                } else {
                    // This case should theoretically not happen if keys match props
                    currentThresholds[key] = DEFAULT_THRESHOLDS[key];
                }
            });
        } else {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                currentThresholds[key] = DEFAULT_THRESHOLDS[key];
            });
        }

        // Return the calculation function
        return (value: number, period: "day" | "week" | "month"): "A" | "B" | "C" | "D" | "E" | "F" | "G" => {
            const periodSuffix = period === "day" ? "Day" : period === "week" ? "Week" : "Month";
            const getThreshold = (grade: string): number => {
                const key = `Threshold${grade}_${periodSuffix}`;
                return currentThresholds[key] ?? DEFAULT_THRESHOLDS[key];
            };

            const thresholds = {
                A: getThreshold("A"),
                B: getThreshold("B"),
                C: getThreshold("C"),
                D: getThreshold("D"),
                E: getThreshold("E"),
                F: getThreshold("F")
            };

            if (value <= thresholds.A) return "A";
            if (value <= thresholds.B) return "B";
            if (value <= thresholds.C) return "C";
            if (value <= thresholds.D) return "D";
            if (value <= thresholds.E) return "E";
            if (value <= thresholds.F) return "F";
            return "G";
        };
        // *** Correction: Dependency array uses the destructured props directly ***
    }, [
        dsDPESettings,
        ThresholdA_Day,
        ThresholdB_Day,
        ThresholdC_Day,
        ThresholdD_Day,
        ThresholdE_Day,
        ThresholdF_Day,
        ThresholdA_Week,
        ThresholdB_Week,
        ThresholdC_Week,
        ThresholdD_Week,
        ThresholdE_Week,
        ThresholdF_Week,
        ThresholdA_Month,
        ThresholdB_Month,
        ThresholdC_Month,
        ThresholdD_Month,
        ThresholdE_Month,
        ThresholdF_Month
    ]);

    const currentGrade = calculateDPEGrade(usineData.consoElec.toNumber(), activePeriod);

    // Totaux globaux non utilisés retirés
    // Variables de synthèse non utilisées retirées pour éviter les avertissements TS

    // Build analysis data for selectedLevel
    const assetsOfSelectedLevel = useMemo(() => {
        if (!selectedLevel || allAssets?.status !== "available" || !allAssets.items) return [] as any[];
        return allAssets.items.filter(a => {
            const assoc = (assetLevel as any)?.get(a);
            const lvl = assoc?.status === "available" ? assoc.value : undefined;
            const name = lvl ? levelName.get(lvl).value ?? "" : "";
            return name === selectedLevel;
        });
    }, [selectedLevel, allAssets, assetLevel, levelName]);

    const selectedLevelMix = useMemo(() => {
        const sum = { elec: 0, gaz: 0, eau: 0, air: 0 };
        assetsOfSelectedLevel.forEach(a => {
            sum.elec += Number(attrTotalConsoElec.get(a).value || 0);
            sum.gaz += Number(attrTotalConsoGaz.get(a).value || 0);
            sum.eau += Number(attrTotalConsoEau.get(a).value || 0);
            sum.air += Number(attrTotalConsoAir.get(a).value || 0);
        });
        return [
            { name: "Électricité", value: sum.elec },
            { name: "Gaz", value: sum.gaz },
            { name: "Eau", value: sum.eau },
            { name: "Air", value: sum.air }
        ];
    }, [assetsOfSelectedLevel, attrTotalConsoElec, attrTotalConsoGaz, attrTotalConsoEau, attrTotalConsoAir]);

    const assetsTableRows = useMemo(() => {
        return assetsOfSelectedLevel.map(a => ({
            name: String((props as any).assetName.get(a).value || "Asset"),
            electricity: Number(attrTotalConsoElec.get(a).value || 0),
            gas: Number(attrTotalConsoGaz.get(a).value || 0),
            water: Number(attrTotalConsoEau.get(a).value || 0),
            air: Number(attrTotalConsoAir.get(a).value || 0)
        }));
    }, [assetsOfSelectedLevel, attrTotalConsoElec, attrTotalConsoGaz, attrTotalConsoEau, attrTotalConsoAir, props]);

    return (
        <React.Fragment>
            {/* LoadingOverlay positioned outside the main content flow */}
            <LoadingOverlay isLoading={isLoading} message={message} />

            {/* Main unified container */}
            <div className="syntheseWidget-root">
                {/* Date controls en tête */}
                <div className="mb-6">
                    <DateRangeSelector onPreset={handlePreset} activeKey={activePreset} />
                </div>

                {/* Retrait du LevelSelector d'en-tête — la sélection se fait via Overview/Analyse */}

                {/* DPE Reworked */}
                <div className="mb-6">
                    <DPEGauge grade={currentGrade} kwhValue={usineData.consoElec.toNumber()} primaryColor="#18213e" />
                </div>

                {/* Cartes de consommation totale */}
                <div className="grid-responsive-4 mb-8">
                    <CardConsoTotal
                        title="Électricité"
                        currentValue={usineData.consoElec}
                        previousValue={usineData.consoElecPrec}
                        type="electricity"
                        baseUnit={baseUnitElectricity as BaseUnit}
                    />
                    <CardConsoTotal
                        title="Gaz"
                        currentValue={usineData.consoGaz}
                        previousValue={usineData.consoGazPrec}
                        type="gas"
                        baseUnit={baseUnitGas as BaseUnit}
                    />
                    <CardConsoTotal
                        title="Eau"
                        currentValue={usineData.consoEau}
                        previousValue={usineData.consoEauPrec}
                        type="water"
                        baseUnit={baseUnitWater as BaseUnit}
                    />
                    <CardConsoTotal
                        title="Air"
                        currentValue={usineData.consoAir}
                        previousValue={usineData.consoAirPrec}
                        type="air"
                        baseUnit={baseUnitAir as BaseUnit}
                    />
                </div>

                {/* Analyse par niveau (DashboardSynthese) */}
                {selectedLevel && (
                    <div className="mb-8">
                        <DashboardSynthese
                            levelNames={visibleLevels}
                            selectedLevel={selectedLevel}
                            onChangeLevel={setSelectedLevel}
                            donutData={selectedLevelMix}
                            assetRows={assetsTableRows}
                        />
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}
