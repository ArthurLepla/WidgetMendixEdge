import { createElement, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts";
import { Big } from "big.js";
import { EnergyConfig } from "../utils/energy";
import { NoDataMessage } from "./NoDataMessage";
import { getAutoGranularity, Granularity, MENDIX_UNIT_TO_MS } from "../lib/utils";

interface HeatMapProps {
    data: Array<{
        timestamp: Date;
        value: Big;
    }>;
    energyConfig: EnergyConfig;
    height?: string;
    startDate?: Date;
    endDate?: Date;
    granularityMode?: "auto" | "strict";
    granularityValue?: number;
    granularityUnit?: Granularity["unit"];
}

type DisplayMode = "day" | "week" | "month"; // day: hours in day, week: days in week, month: days in month

export const HeatMap = ({
    data,
    energyConfig,
    height = "400px",
    startDate,
    endDate,
    granularityMode = "auto",
    granularityValue,
    granularityUnit
}: HeatMapProps): React.ReactElement => {
    const hasData = data && data.length > 0;

    const options: EChartsOption = useMemo(() => {
        if (!startDate || !endDate || !hasData) {
            return {};
        }

        // 1. Déterminer la granularité et la durée
        const resolvedGranularity: Granularity =
            granularityMode === "strict" && granularityValue && granularityUnit
                ? { value: granularityValue, unit: granularityUnit }
                : getAutoGranularity(startDate, endDate);

        const intervalMs = resolvedGranularity.value * (MENDIX_UNIT_TO_MS[resolvedGranularity.unit] || 0);
        if (intervalMs === 0) return {};

        const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

        // 2. Déterminer le mode d'affichage
        const getDisplayMode = (): DisplayMode => {
            if (resolvedGranularity.unit === "minute" || resolvedGranularity.unit === "hour") {
                return "day";
            }
            if (durationDays <= 31 && resolvedGranularity.unit === "day") {
                return "week";
            }
            return "month";
        };
        const displayMode = getDisplayMode();

        // 3. Agréger les données par bucket
        const aggregatedData = new Map<number, number>();
        data.forEach(item => {
            if (item.timestamp >= startDate && item.timestamp <= endDate) {
                const bucketStart = Math.floor(item.timestamp.getTime() / intervalMs) * intervalMs;
                const existingValue = aggregatedData.get(bucketStart) || 0;
                aggregatedData.set(bucketStart, existingValue + item.value.toNumber());
            }
        });

        // 4. Générer tous les points de la grille et les labels
        const points: Array<{ xLabel: string; yLabel: string; value: number | null }> = [];
        const xLabelSet = new Set<string>();
        const yLabelMap = new Map<string, number>(); // Map<Label, SortKey>

        let current = new Date(startDate.getTime());
        current.setHours(0, 0, 0, 0);
        const endDateLimit = new Date(endDate.getTime());

        while (current <= endDateLimit) {
            const bucketStart = Math.floor(current.getTime() / intervalMs) * intervalMs;
            const value = aggregatedData.get(bucketStart);

            let xLabel = "";
            let yLabel = "";
            let ySortKey = 0;

            const date = new Date(bucketStart);

            switch (displayMode) {
                case "day": {
                    const hour = date.getHours();
                    const minute = date.getMinutes();
                    xLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

                    const dayStart = new Date(date);
                    dayStart.setHours(0, 0, 0, 0);
                    yLabel = dayStart.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
                    ySortKey = dayStart.getTime();
                    break;
                }
                case "week": {
                    const dayOfWeek = (date.getDay() + 6) % 7; // Lundi = 0
                    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                    xLabel = days[dayOfWeek];

                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - dayOfWeek);
                    weekStart.setHours(0, 0, 0, 0);

                    yLabel = `Semaine du ${weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
                    ySortKey = weekStart.getTime();
                    break;
            }
                case "month": {
                    xLabel = String(date.getDate());

                    const monthStart = new Date(date);
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);

                    yLabel = monthStart.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
                    ySortKey = monthStart.getTime();
                        break;
                }
            }

            xLabelSet.add(xLabel);
            if (!yLabelMap.has(yLabel)) {
                yLabelMap.set(yLabel, ySortKey);
            }

            points.push({ xLabel, yLabel, value: value !== undefined ? value : null });

            current = new Date(current.getTime() + intervalMs);
        }

        const sortedXLabels = Array.from(xLabelSet).sort((a, b) => {
            if (displayMode === "day") {
                return a.localeCompare(b);
            }
            if (displayMode === "week") {
                const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                return days.indexOf(a) - days.indexOf(b);
            }
            return Number(a) - Number(b);
        });

        const sortedYLabels = Array.from(yLabelMap.entries())
            .sort(([, sortKeyA], [, sortKeyB]) => sortKeyA - sortKeyB)
            .map(([label]) => label);

        const finalPoints = points
            .map(({ xLabel, yLabel, value }) => {
                const xIndex = sortedXLabels.indexOf(xLabel);
                const yIndex = sortedYLabels.indexOf(yLabel);
                if (xIndex === -1 || yIndex === -1) return null;
                return [xIndex, yIndex, value];
            })
            .filter((p): p is [number, number, number | null] => p !== null);

        const maxVal = Math.max(0, ...Array.from(aggregatedData.values()));

        return {
            textStyle: {
                fontFamily: "Barlow, sans-serif",
                color: "#18213e"
            },
            title: {
                text: `Répartition de la consommation ${energyConfig.label.toLowerCase()}`,
                left: "center",
                top: 10,
                textStyle: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#18213e"
                }
            },
            tooltip: {
                position: "top",
                formatter: (params: any) => {
                    const { value, color } = params;
                    const [xIdx, yIdx, dataValue] = value;
                    const yLabel = sortedYLabels[yIdx];
                    const xLabel = sortedXLabels[xIdx];
                    const formattedValue =
                        dataValue === null ? "Aucune donnée" : `${(dataValue as number).toFixed(2)} ${energyConfig.unit}`;
                    
                    const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;

                    return `
                        <div style="font-size:14px; color:#18213e; font-weight:600;">${yLabel} - ${xLabel}</div>
                        <div style="font-size:12px; color:#333;">${marker}${formattedValue}</div>
                    `;
                }
            },
            grid: {
                left: "10%",
                right: "10%",
                top: "15%",
                bottom: "25%",
                containLabel: true
            },
            xAxis: {
                type: "category",
                data: sortedXLabels,
                splitArea: { show: true }
            },
            yAxis: {
                type: "category",
                data: sortedYLabels,
                inverse: true,
                splitArea: { show: true }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: "8%",
                inRange: {
                    color: [
                        energyConfig.color + "1A", // light
                        energyConfig.color // dark
                    ]
                }
            },
            series: [
                {
                    name: "Consommation",
                    type: "heatmap",
                    data: finalPoints.filter(p => p[2] !== null),
                    label: { show: false },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 2,
                        borderRadius: 3
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: "#333",
                            borderWidth: 1
                        }
                    }
                },
                {
                    name: "Pas de données",
                    type: "heatmap",
                    data: finalPoints.filter(p => p[2] === null).map(([x, y]) => [x, y, 0]),
                        itemStyle: {
                        color: "#ffffff",
                        borderColor: '#e5e7eb', // Bordure gris clair pour la visibilité
                        borderWidth: 1,
                        borderRadius: 3
                    },
                    label: { show: false },
                    tooltip: { show: false },
                    emphasis: { disabled: true }
                }
            ]
        };
    }, [data, energyConfig, hasData, startDate, endDate, granularityMode, granularityValue, granularityUnit]);

    return (
        <div className="widget-detailswidget tw-w-full tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-6 tw-border tw-border-gray-100 tw-transition-shadow tw-duration-300 hover:tw-shadow-xl">
            {hasData ? (
                <ReactECharts option={options} style={{ height }} opts={{ renderer: "svg" }} />
            ) : (
                <NoDataMessage 
                    energyConfig={energyConfig} 
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
        </div>
    );
}; 