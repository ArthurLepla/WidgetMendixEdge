import { createElement, useState, useMemo, ReactElement, ReactNode } from "react";
import Big from "big.js";
import { EditableValue, ActionValue } from "mendix";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { BarChart3, Zap, Flame, Droplets, Wind } from "lucide-react";

import { AssetData, AssetStats } from "../../CompareData";
import { EnergyConfig, getMetricTypeFromName } from "../../utils/energy";
import { LineChart, MachineData } from "../LineChart";
import { MachineCard } from "../MachineCard";
import { PieChart } from "../PieChart";
import { MachineTable } from "../MachineTable";
import { ExportMenu } from "../Export/ExportMenu";
import type { Row } from "../Export/ExportLogic";
import { EnergyType } from "../../utils/energy";
import { GranularityPopover } from "../GranularityControl";

import "./ChartContainer.css";

interface ChartContainerProps {
    data: AssetData[];
    stats: AssetStats[];
    energyConfig: EnergyConfig;
    viewMode: "energetic" | "ipe";
    showDoubleIPEToggle?: boolean;
    showGranularityControls?: boolean;
    onAddProductionClick?: ActionValue;
    startDate?: Date;
    endDate?: Date;
    // Labels intelligents pour IPE (facultatifs) — alignés avec Detailswidget naming
    ipe1Name?: string;
    ipe2Name?: string;
    // Props pour les contrôles d'affichage
    displayModeAttr?: EditableValue<string>;
    displayTimeAttr?: EditableValue<Big>;
    displayUnitAttr?: EditableValue<string>;
    displayPreviewOKAttr?: EditableValue<boolean>;
    bufferModeAttr?: EditableValue<string>;
    bufferTimeAttr?: EditableValue<Big>;
    bufferUnitAttr?: EditableValue<string>;
    onModeChange?: ActionValue;
    onTimeChange?: ActionValue;
    // Props spécifiques au comparatif
    onAssetClick?: (assetId: string) => void;
    selectedAssets?: Array<{ id: string; name: string }>;
}

// Affichage figé en mode "dashboard" (plus de modes sélectionnables)

// Conversion des types d'énergie - aligné avec le système Mendix
const mapEnergyConfigToType = (energyConfig: EnergyConfig): EnergyType => {
    const name = energyConfig.name.toLowerCase();
    if (name.includes("électr") || name.includes("elec")) return "Elec";
    if (name.includes("gaz") || name.includes("gas")) return "Gaz";
    if (name.includes("eau") || name.includes("water")) return "Eau";
    if (name.includes("air")) return "Air";
    return "Elec"; // par défaut
};

// Fonction pour obtenir l'icône d'énergie
function getEnergyIcon(label: string | undefined, color: string) {
    if (!label) return createElement(BarChart3, { size: 36, style: { color } });

    const l = label.toLowerCase();
    if (l.includes("elec") || l.includes("élec")) return createElement(Zap, { size: 36, style: { color } });
    if (l.includes("gaz") || l.includes("gas")) return createElement(Flame, { size: 36, style: { color } });
    if (l.includes("eau") || l.includes("water")) return createElement(Droplets, { size: 36, style: { color } });
    if (l.includes("air")) return createElement(Wind, { size: 36, style: { color } });

    return createElement(BarChart3, { size: 36, style: { color } });
}

export function ChartContainer({
    data,
    stats,
    energyConfig,
    viewMode,
    showDoubleIPEToggle = false,
    showGranularityControls,
    onAddProductionClick,
    startDate,
    endDate,
    ipe1Name,
    ipe2Name,
    // optional display props (callbacks)
    onModeChange,
    onTimeChange
}: ChartContainerProps): ReactElement {

    // États locaux
    const [activeIPE, setActiveIPE] = useState<1 | 2>(1);

    // Conversion vers le type EnergyType existant
    const energyType: EnergyType = mapEnergyConfigToType(energyConfig);

    // Granularité (UI activée via showGranularityControls)
    const [granularityMode, setGranularityMode] = useState<"auto" | "strict">("auto");
    const [granularityValue, setGranularityValue] = useState<number>(5);
    const [granularityUnit, setGranularityUnit] = useState<"minute" | "hour" | "day" | "week" | "month" | "year">("minute");

    const analysisDurationMs = useMemo(() => {
        if (!startDate || !endDate) return undefined;
        const diff = endDate.getTime() - startDate.getTime();
        return diff > 0 ? diff : undefined;
    }, [startDate, endDate]);

    const autoGranularity = useMemo<{ value: number; unit: string }>(() => {
        const unitOptions: Record<"minute" | "hour" | "day" | "week" | "month" | "year", number[]> = {
            minute: [5, 10, 15, 20, 30, 45, 60],
            hour: [1, 2, 3, 4, 6, 8, 12, 24],
            day: [1, 2, 3, 5, 7, 10, 14, 21, 30],
            week: [1, 2, 3, 4, 6, 8, 12],
            month: [1, 2, 3, 4, 6, 12],
            year: [1, 2, 3, 5]
        };
        const unitMs: Record<"minute" | "hour" | "day" | "week" | "month" | "year", number> = {
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000
        };
        const unitLabel: Record<string, string> = {
            minute: "minutes",
            hour: "heures",
            day: "jours",
            week: "semaines",
            month: "mois",
            year: "années"
        };
        if (!analysisDurationMs) return { value: 5, unit: unitLabel.minute };
        type UnitKey = keyof typeof unitOptions;
        let best: { unit: UnitKey; value: number; score: number } | null = null;
        (Object.keys(unitOptions) as UnitKey[]).forEach((u) => {
            unitOptions[u].forEach((val) => {
                const bucket = val * unitMs[u];
                if (bucket <= 0 || bucket > analysisDurationMs) return;
                const points = Math.ceil(analysisDurationMs / bucket);
                if (points > 100) return;
                const score = Math.abs(points - 50);
                if (!best || score < best.score) {
                    best = { unit: u, value: val, score };
                }
            });
        });
        const chosen = best ?? { unit: "minute" as UnitKey, value: 5, score: 0 };
        return { value: chosen.value, unit: unitLabel[chosen.unit] };
    }, [analysisDurationMs]);

    // Gestion des données pour le double IPE
    const { ipeData1, ipeData2, hasIPEData1, hasIPEData2 } = useMemo(() => {
        if (viewMode !== "ipe") {
            return {
                ipeData1: data,
                ipeData2: [],
                hasIPEData1: data.length > 0,
                hasIPEData2: false
            };
        }

        // En mode IPE, séparer les données selon la variante détectée
        const getType = (item: AssetData) => item.metricType || getMetricTypeFromName(item.name);
        // IPE1 => IPE_kg ; IPE2 => IPE
        const ipeMetrics1 = data.filter(item => getType(item) === "IPE_kg");
        const ipeMetrics2 = data.filter(item => getType(item) === "IPE");

        return {
            ipeData1: ipeMetrics1,
            ipeData2: ipeMetrics2,
            hasIPEData1: ipeMetrics1.length > 0,
            hasIPEData2: ipeMetrics2.length > 0
        };
    }, [data, viewMode]);

    // Déterminer si le toggle IPE doit être affiché
    const shouldShowIPEToggle = showDoubleIPEToggle && viewMode === "ipe" && hasIPEData1 && hasIPEData2;

    // Données actives selon l'IPE sélectionné
    const activeData = shouldShowIPEToggle ? (activeIPE === 1 ? ipeData1 : ipeData2) : data;
    const activeStats = stats.filter(stat => 
        activeData.some(item => item.name === stat.name)
    );

    // Extraire l'unité depuis les données actives (unité réelle des variables)
    const actualUnit = useMemo(() => {
        if (activeData.length === 0) return energyConfig.unit;
        
        // Prendre l'unité de la première série de données
        const firstUnit = activeData[0].unit;
        
        // Vérifier que toutes les séries ont la même unité
        const allSameUnit = activeData.every(asset => asset.unit === firstUnit);
        
        if (!allSameUnit) {
            console.warn("[ChartContainer] Unités différentes détectées dans les séries:", 
                activeData.map(d => ({ name: d.name, unit: d.unit })));
        }
        
        return firstUnit || energyConfig.unit;
    }, [activeData, energyConfig.unit]);

    // Conversion AssetData vers MachineData pour les composants existants
    const machineData: MachineData[] = activeData.map(asset => ({
        name: asset.name,
        timestamps: asset.timestamps,
        values: asset.values
    }));

    // Conversion AssetStats vers format pour MachineCard
    const machineCardData = activeStats.map(stat => ({
        name: stat.name,
        currentValue: stat.currentValue,
        maxValue: stat.maxValue,
        minValue: stat.minValue,
        sumValue: stat.sumValue,
        // Props IPE spécifiques
        totalConsommationIPE: stat.totalConsommationIPE,
        totalProduction: stat.totalProduction,
        ipeValue: stat.ipeValue
    }));

    // Données d'export - Format Row compatible avec valeurs numériques
    const exportData: Row[] = useMemo(() => {
        return activeData.flatMap(asset => 
            asset.timestamps.map((timestamp, index) => ({
                asset: asset.name,
                timestamp,
                value: asset.values[index].toNumber(), // Conversion Big vers number
                metricType: asset.metricType || "",
                energyType: asset.energyType || ""
            }))
        );
    }, [activeData]);

    // Nom de fichier pour l'export
    const exportFilename = useMemo(() => {
        const baseFilename = "comparison_data";
        const modePrefix = viewMode === "ipe" ? "ipe" : energyConfig.name.toLowerCase();
        const dateRange = startDate && endDate ? 
            `_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}` : "";
        return `${modePrefix}_${baseFilename}${dateRange}`;
    }, [viewMode, energyConfig.name, startDate, endDate]);

    // Plus de changement de mode d'affichage: Dashboard forcé

    // Gestion du changement d'IPE
    const handleIPEToggle = (ipe: 1 | 2) => {
        setActiveIPE(ipe);
    };

    // Conversion ActionValue vers function pour les composants existants
    const handleAddProductionClick = onAddProductionClick?.canExecute ? 
        () => onAddProductionClick.execute() : undefined;

    const hasData = activeData.length > 0;
    const icon = getEnergyIcon(energyConfig.name, energyConfig.color);
    const containerTitle = `Comparaison ${energyConfig.name}${viewMode === "ipe" ? " (IPE)" : ""}`;

    // Rendu des enfants selon le mode
    const renderContent = (): ReactNode => {
        if (!hasData) {
            return createElement("div", { className: "empty-state" },
                createElement("div", { className: "empty-state-content" },
                    createElement("div", { className: "empty-state-icon-wrapper" },
                        createElement(BarChart3, { size: 40, className: "empty-state-icon" })
                    ),
                    createElement("h3", { className: "empty-state-title" }, "Aucune donnée disponible"),
                    createElement("p", { className: "empty-state-description" }, 
                        "Aucune donnée n'est disponible pour la période sélectionnée."
                    )
                )
            );
        }

        // Rendu figé du tableau de bord complet
        return createElement("div", { className: "widget-layout-container" },
            // Cartes
            createElement("div", { className: "widget-cards-grid" },
                ...machineCardData.map((machine) =>
                    createElement(MachineCard, {
                        key: machine.name,
                        name: machine.name,
                        currentValue: machine.currentValue,
                        maxValue: machine.maxValue,
                        minValue: machine.minValue,
                        sumValue: machine.sumValue,
                        type: energyType,
                        viewMode: viewMode,
                        totalConsommationIPE: machine.totalConsommationIPE,
                        totalProduction: machine.totalProduction,
                        ipeValue: machine.ipeValue,
                        unit: actualUnit
                    })
                )
            ),
            // Graphiques gauche/droite
            createElement("div", { className: "widget-charts-container" },
                createElement("div", { className: "widget-chart-left" },
                    createElement(LineChart, {
                        data: machineData,
                        type: energyType,
                        viewMode: viewMode,
                        onAddProductionClick: handleAddProductionClick,
                        unit: actualUnit
                    })
                ),
                createElement("div", { className: "widget-chart-right" },
                    createElement(PieChart, {
                        machines: activeStats.map(m => ({
                            name: m.name,
                            currentValue: m.currentValue,
                            sumValue: m.sumValue
                        })),
                        type: energyType,
                        viewMode: viewMode,
                        unit: actualUnit
                    })
                )
            ),
            // Tableau
            createElement("div", { className: "widget-table-container" },
                createElement(MachineTable, {
                    machines: activeStats.map(m => ({
                        name: m.name,
                        currentValue: m.currentValue,
                        minValue: m.minValue,
                        sumValue: m.sumValue,
                        maxValue: m.maxValue
                    })),
                    type: energyType,
                    viewMode: viewMode,
                    unit: actualUnit
                })
            )
        );
    };

    return createElement("div", { className: "chart-container" },
        // Header avec titre et contrôles
        createElement("header", { className: "chart-header" },
            createElement("div", { className: "chart-header-content" },
                createElement("div", { className: "chart-title-wrapper" },
                    createElement("div", { className: "chart-icon-wrapper" }, icon),
                    createElement("div", null,
                        createElement("h2", { className: "chart-title" }, containerTitle),
                        createElement("div", { className: "chart-subtitle" },
                            `${activeData.length} asset${activeData.length > 1 ? "s" : ""} comparé${activeData.length > 1 ? "s" : ""}`
                        )
                    )
                ),

                // Actions wrapper pour toggle IPE, granularité et export
                createElement("div", { className: "chart-header-actions" },
                    // Toggle IPE si applicable
                    shouldShowIPEToggle && createElement(IPEToggle, {
                        ipe1Name: ipe1Name || "IPE 1",
                        ipe2Name: ipe2Name || "IPE 2",
                        activeIPE: activeIPE,
                        onToggle: handleIPEToggle
                    }),

                    // Granularité: si activée, afficher le contrôle; sinon, simple display
                    (viewMode === "energetic" || viewMode === "ipe") && (
                        showGranularityControls
                            ? createElement(GranularityControlOrPopover as any, {
                                mode: granularityMode,
                                value: granularityValue,
                                unit: granularityUnit,
                                onModeChange: (m: "Auto" | "Strict") => {
                                    const next = m === "Auto" ? "auto" : "strict";
                                    setGranularityMode(next);
                                    if (onModeChange?.canExecute) onModeChange.execute();
                                },
                                onValueChange: (v: number) => {
                                    setGranularityValue(v);
                                    if (onTimeChange?.canExecute) onTimeChange.execute();
                                },
                                onUnitChange: (u: any) => {
                                    setGranularityUnit(u);
                                    if (onTimeChange?.canExecute) onTimeChange.execute();
                                },
                                autoGranularity: { value: autoGranularity.value, unit: autoGranularity.unit },
                                isDisabled: !hasData,
                                analysisDurationMs: analysisDurationMs
                            })
                            : createElement("div", { className: "simple-granularity-display" },
                                createElement("span", { className: "simple-granularity-label" }, "Granularité"),
                                createElement("span", { className: "simple-granularity-value" }, `Auto: ${autoGranularity.value} ${autoGranularity.unit}`)
                            )
                    ),

                    // Menu d'export
                    hasData && createElement(ExportMenu, {
                        data: exportData,
                        filename: exportFilename
                    })
                )
            )
        ),

        // Contenu principal
        createElement("div", { className: "chart-content" },
            renderContent()
        )
    );
}
// Render GranularityControl on wide screens, GranularityPopover on compact screens
const GranularityControlOrPopover = (props: any) => {
    const isCompact = typeof window !== "undefined" ? window.innerWidth < 1024 : false;
    return isCompact 
        ? createElement(GranularityPopover as any, props) 
        : createElement(require("../GranularityControl/GranularityControl").GranularityControl as any, props);
};


// Composant IPEToggle adapté au style
const IPEToggle = ({ 
    ipe1Name, 
    ipe2Name, 
    activeIPE, 
    onToggle 
}: { 
    ipe1Name: string; 
    ipe2Name: string; 
    activeIPE: 1 | 2; 
    onToggle: (ipe: 1 | 2) => void;
}) => {
    const handleValueChange = (value: string) => {
        if (value === "1" || value === "2") {
            onToggle(parseInt(value) as 1 | 2);
        }
    };

    return createElement(ToggleGroup.Root, {
        className: "ipe-toggle-group",
        type: "single",
        value: activeIPE.toString(),
        onValueChange: handleValueChange,
        "aria-label": "Sélection IPE"
    },
        createElement(ToggleGroup.Item, {
            className: "ipe-toggle-item",
            value: "1",
            "aria-label": ipe1Name || "IPE 1"
        }, ipe1Name || "IPE 1"),
        createElement(ToggleGroup.Item, {
            className: "ipe-toggle-item", 
            value: "2",
            "aria-label": ipe2Name || "IPE 2"
        }, ipe2Name || "IPE 2")
    );
};