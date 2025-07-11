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

// Modes d'affichage: "weekly" est une vue calendaire verticale (<= 31 jours).
// "calendarWide" est la vue type GitHub (> 31 jours).
type SmartDisplayMode = "hourly" | "daily" | "weekly" | "calendarWide";

interface HeatmapConfig {
    mode: SmartDisplayMode;
    aggregationPeriod: number;
    xLabels: string[];
    yLabels: string[];
    maxCells: number;
    monthLabels?: { index: number; label: string }[];
}

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

        const durationMs = endDate.getTime() - startDate.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);

        const resolvedGranularity: Granularity =
            granularityMode === "strict" && granularityValue && granularityUnit
                ? { value: granularityValue, unit: granularityUnit }
                : getAutoGranularity(startDate, endDate);

        const intervalMs = resolvedGranularity.value * (MENDIX_UNIT_TO_MS[resolvedGranularity.unit] || 0);
        if (intervalMs === 0) return {};

        const toLocalISOString = (date: Date) => {
            const pad = (num: number) => num.toString().padStart(2, "0");
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        };

        const parseLocalDate = (dateString: string) => new Date(`${dateString}T00:00:00`);

        const getWeekOfYear = (date: Date): number => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        };

        const getSmartDisplayConfig = (): HeatmapConfig => {
            if (durationDays <= 2) {
                return {
                    mode: "hourly",
                    aggregationPeriod: Math.max(intervalMs, 3600000),
                    xLabels: [],
                    yLabels: [],
                    maxCells: 48
                };
            }
            if (durationDays <= 7) {
                return {
                    mode: "daily",
                    aggregationPeriod: 3600000 * 4,
                    xLabels: ["00h-04h", "04h-08h", "08h-12h", "12h-16h", "16h-20h", "20h-24h"],
                    yLabels: [],
                    maxCells: 42
                };
            }
            if (durationDays <= 31) {
                return {
                    mode: "weekly",
                    aggregationPeriod: 86400000,
                    xLabels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
                    yLabels: [],
                    maxCells: 35
                };
            }
            return {
                mode: "calendarWide",
                aggregationPeriod: 86400000,
                xLabels: [],
                yLabels: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
                maxCells: 371
            };
        };

        const displayConfig = getSmartDisplayConfig();

        const aggregateData = () => {
            const aggregated = new Map<string, { value: number; count: number }>();
            data.forEach(item => {
                if (item.timestamp >= startDate && item.timestamp <= endDate) {
                    let key = "";
                    const date = new Date(item.timestamp);
                    switch (displayConfig.mode) {
                        case "hourly": {
                            const dayStr = toLocalISOString(date);
                            const hourGroup = Math.floor(date.getHours() / (displayConfig.aggregationPeriod / 3600000));
                            const hour = hourGroup * (displayConfig.aggregationPeriod / 3600000);
                            key = `${dayStr}_${hour}`;
                            break;
                        }
                        case "daily": {
                            const dayStr = toLocalISOString(date);
                            const periodIndex = Math.floor(date.getHours() / 4);
                            key = `${dayStr}_${periodIndex}`;
                            break;
                        }
                        case "weekly": {
                            const dayOfWeek = (date.getDay() + 6) % 7;
                            const weekStart = new Date(date);
                            weekStart.setDate(date.getDate() - dayOfWeek);
                            weekStart.setHours(0, 0, 0, 0);
                            key = `${toLocalISOString(weekStart)}_${dayOfWeek}`;
                            break;
                        }
                        case "calendarWide":
                            key = toLocalISOString(date);
                            break;
                    }
                    const existing = aggregated.get(key) || { value: 0, count: 0 };
                    aggregated.set(key, {
                        value: existing.value + item.value.toNumber(),
                        count: existing.count + 1
                    });
                }
            });
            return aggregated;
        };

        const aggregatedData = aggregateData();

        const buildChartData = () => {
            let points: any[] = [];
            let xLabels: string[] = [];
            let yLabels: string[] = [];

            switch (displayConfig.mode) {
                case "hourly": {
                    const aggregationHours = displayConfig.aggregationPeriod / 3600000;
                    const hoursInDay = Array.from({ length: 24 / aggregationHours }, (_, i) => i * aggregationHours);
                    xLabels = hoursInDay.map(h => `${h}h`);
                    const daysSet = new Set<string>();
                    aggregatedData.forEach((_, key) => {
                        const [day] = key.split("_");
                        daysSet.add(day);
                    });
                    yLabels = Array.from(daysSet).sort();
                    yLabels.forEach((day, yIdx) => {
                        hoursInDay.forEach((hour, xIdx) => {
                            const key = `${day}_${hour}`;
                            const data = aggregatedData.get(key);
                            points.push([xIdx, yIdx, data ? data.value : null]);
                        });
                    });
                    break;
                }
                case "daily": {
                    xLabels = displayConfig.xLabels;
                    const allDays: string[] = [];
                    if (startDate && endDate) {
                        let current = new Date(startDate);
                        current.setHours(0, 0, 0, 0);
                        while (current <= endDate) {
                            allDays.push(toLocalISOString(current));
                            current.setDate(current.getDate() + 1);
                        }
                    }
                    yLabels = allDays;
                    allDays.forEach((day, yIdx) => {
                        (displayConfig.xLabels as string[]).forEach((_, xIdx) => {
                            const key = `${day}_${xIdx}`;
                            const data = aggregatedData.get(key);
                            points.push([xIdx, yIdx, data ? data.value : null]);
                        });
                    });
                    break;
                }
                case "weekly": {
                    xLabels = displayConfig.xLabels;
                    const allWeeks: string[] = [];
                    if (startDate && endDate) {
                        let current = new Date(startDate);
                        current.setHours(0, 0, 0, 0);
                        const dayOfWeek = (current.getDay() + 6) % 7;
                        current.setDate(current.getDate() - dayOfWeek);
                        while (current <= endDate) {
                            allWeeks.push(toLocalISOString(current));
                            current.setDate(current.getDate() + 7);
                        }
                    }
                    const displayWeeks = allWeeks.slice(-8);
                    yLabels = displayWeeks;
                    displayWeeks.forEach((week, yIdx) => {
                        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                            const key = `${week}_${dayIndex}`;
                            const data = aggregatedData.get(key);
                            points.push([dayIndex, yIdx, data ? data.value : null]);
                        }
                    });
                    break;
                }
                case "calendarWide": {
                    yLabels = displayConfig.yLabels;
                    if (!startDate || !endDate) break;

                    const gridStartDate = new Date(startDate);
                    gridStartDate.setDate(gridStartDate.getDate() - gridStartDate.getDay());
                    gridStartDate.setHours(0, 0, 0, 0);

                    const weekPositions: Date[] = [];
                    const monthLabels: { index: number; label: string }[] = [];
                    let currentMonth = -1;

                    for (let d = new Date(gridStartDate); d <= endDate; d.setDate(d.getDate() + 7)) {
                        weekPositions.push(new Date(d));
                        if (d.getMonth() !== currentMonth) {
                            currentMonth = d.getMonth();
                            monthLabels.push({
                                index: weekPositions.length - 1,
                                label: d.toLocaleDateString("fr-FR", { month: "short" })
                            });
                        }
                    }
                    xLabels = weekPositions.map(d => toLocalISOString(d));
                    displayConfig.monthLabels = monthLabels;
                    displayConfig.xLabels = xLabels;

                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        const weekIndex = Math.floor((d.getTime() - gridStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                        const dayIndex = d.getDay();
                        const key = toLocalISOString(d);
                        const data = aggregatedData.get(key);
                        points.push({
                            value: [weekIndex, dayIndex, data ? data.value : null],
                            name: key
                        });
                    }
                    break;
                }
            }
            return { points, xLabels, yLabels };
        };

        const { points, xLabels, yLabels } = buildChartData();
        const maxVal = Math.max(0, ...points.map((p: any) => (Array.isArray(p) ? p[2] : p.value[2]) || 0));

        const getAdaptiveConfig = () => {
            const baseConfig = {
                textStyle: {
                    fontFamily: "Barlow, sans-serif",
                    color: "#18213e"
                },
                tooltip: {
                    position: "top",
                    formatter: (params: any) => {
                        const { value, color, name } = params;
                        let header = "";
                        let dataValue = Array.isArray(value) ? value[2] : value;
                        if (typeof value === "object" && value !== null && "value" in value) {
                            dataValue = value.value[2];
                        }

                        if (displayConfig.mode === "calendarWide") {
                            const date = parseLocalDate(name);
                            header = date.toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long"
                            });
                        } else {
                            const [xIdx, yIdx] = value;
                            if (displayConfig.mode === "weekly") {
                                const weekStartDate = parseLocalDate(yLabels[yIdx]);
                                const cellDate = new Date(weekStartDate);
                                cellDate.setDate(weekStartDate.getDate() + xIdx);
                                header = cellDate.toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long"
                                });
                            } else if (displayConfig.mode === "hourly") {
                                header = `${parseLocalDate(yLabels[yIdx]).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long"
                                })} - ${(xLabels as string[])[xIdx]}`;
                            } else if (displayConfig.mode === "daily") {
                                header = `${parseLocalDate(yLabels[yIdx]).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long"
                                })} - ${(xLabels as string[])[xIdx]}`;
                            }
                        }

                        const formattedValue =
                            dataValue === null || dataValue === -1
                                ? "Aucune donnée"
                                : `${dataValue.toLocaleString("fr-FR", {
                                      maximumFractionDigits: 2
                                  })} ${energyConfig.unit}`;

                        const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;

                        return `
                            <div style="font-size:14px; font-weight:600;">${header}</div>
                            <div style="font-size:12px; margin-top:4px;">${marker}${formattedValue}</div>
                        `;
                    }
                }
            };

            if (displayConfig.mode === "calendarWide") {
                const monthLabels = displayConfig.monthLabels || [];
                const xAxisLabels = xLabels.map((_label, index) => {
                    const monthLabel = monthLabels.find(l => l.index === index);
                    return monthLabel ? monthLabel.label : "";
                });
                return {
                    ...baseConfig,
                    grid: { left: "3%", right: "8%", top: 60, bottom: "20%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: xAxisLabels,
                        position: "bottom",
                        axisTick: { show: false },
                        axisLine: { show: false },
                        axisLabel: { interval: 0, color: "#666", fontWeight: "bold", fontSize: 12 }
                    },
                    yAxis: {
                        type: "category",
                        data: yLabels,
                        inverse: true,
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { show: false }
                    }
                };
            }

            return {
                ...baseConfig,
                grid: {
                    left: "12%",
                    right: "10%",
                    top: "15%",
                    bottom: (xLabels as string[]).length > 7 ? "25%" : "20%",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: xLabels,
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: (xLabels as string[]).length > 10 ? 10 : 12
                    }
                },
                yAxis: {
                    type: "category",
                    data: yLabels,
                    inverse: true,
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: yLabels.length > 10 ? 10 : 12,
                        formatter: (value: string) => {
                            const d = parseLocalDate(value);
                            if (displayConfig.mode === "weekly") {
                                return `S${getWeekOfYear(d)}`;
                            }
                            if (displayConfig.mode === "hourly" || displayConfig.mode === "daily") {
                                return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                            }
                            return value;
                        }
                    }
                }
            };
        };

        const adaptiveConfig = getAdaptiveConfig();

        const getTitle = () => {
            const baseTitle = `Consommation ${energyConfig.label.toLowerCase()}`;
            switch (displayConfig.mode) {
                case "hourly":
                    return `${baseTitle} - Vue horaire`;
                case "daily":
                    return `${baseTitle} - Vue journalière`;
                case "weekly":
                    return `${baseTitle} - Vue hebdomadaire`;
                case "calendarWide":
                    return `${baseTitle} - Vue calendaire`;
                default:
                    return baseTitle;
            }
        };

        return {
            ...adaptiveConfig,
            title: {
                text: getTitle(),
                left: "center",
                top: 10,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#18213e"
                }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                calculable: true,
                orient: displayConfig.mode === "calendarWide" ? "vertical" : "horizontal",
                left: displayConfig.mode === "calendarWide" ? "right" : "center",
                bottom: displayConfig.mode === "calendarWide" ? "center" : "5%",
                itemWidth: 15,
                itemHeight: displayConfig.mode === "calendarWide" ? 120 : 120,
                text: ["Max", "Min"],
                textStyle: {
                    fontSize: 10
                },
                inRange: {
                    color: ["#f0f0f0", energyConfig.color + "40", energyConfig.color + "80", energyConfig.color]
                }
            },
            series: [
                {
                    name: "Consommation",
                    type: "heatmap",
                    data: points.filter((p: any) => (Array.isArray(p) ? p[2] !== null : p.value[2] !== null)),
                    label: { show: false },
                    itemStyle: {
                        borderColor: "#fff",
                        borderWidth: displayConfig.mode === "calendarWide" ? 2 : 1,
                        borderRadius: 3
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 5,
                            shadowColor: "rgba(0, 0, 0, 0.2)"
                        }
                    }
                },
                {
                    name: "Pas de données",
                    type: "heatmap",
                    data: points
                        .filter((p: any) => (Array.isArray(p) ? p[2] === null : p.value[2] === null))
                        .map((p: any) => {
                            if (!Array.isArray(p)) {
                                return { value: [p.value[0], p.value[1], -1], name: p.name };
                            }
                            return [p[0], p[1], -1];
                        }),
                    itemStyle: {
                        color: "#f9fafb",
                        borderColor: "#e5e7eb",
                        borderWidth: 1,
                        borderRadius: 2
                    },
                    label: { show: false },
                    emphasis: { disabled: true }
                }
            ]
        };
    }, [data, energyConfig, hasData, startDate, endDate, granularityMode, granularityValue, granularityUnit]);

    const adaptiveHeight = useMemo(() => {
        if (!options.series) return height;

        const titleText = (options.title as any)?.text || "";

        if (titleText.includes("Vue calendaire")) {
            return "300px";
        }
        if (titleText.includes("Vue hebdomadaire")) {
            return "400px";
        }
        return "500px";
    }, [options, height]);

    return (
        <div className="widget-detailswidget tw-w-full tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-6 tw-border tw-border-gray-100 tw-transition-shadow tw-duration-300 hover:tw-shadow-xl">
            {hasData ? (
                <ReactECharts
                    option={options}
                    style={{ height: adaptiveHeight }}
                    opts={{ renderer: "svg" }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            ) : (
                <NoDataMessage energyConfig={energyConfig} startDate={startDate} endDate={endDate} />
            )}
        </div>
    );
};