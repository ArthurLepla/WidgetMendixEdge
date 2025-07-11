import { createElement, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts";
import { Big } from "big.js";
import { EnergyConfig } from "../utils/energy";
import { NoDataMessage } from "./NoDataMessage";
import { getAutoGranularity, Granularity, MENDIX_UNIT_TO_MS } from "../lib/utils";

interface LineChartProps {
    data: Array<{
        timestamp: Date;
        value: Big;
    }>;
    energyConfig: EnergyConfig;
    height?: string;
    startDate?: Date;
    endDate?: Date;
    title?: string;
    granularityMode?: "auto" | "strict";
    granularityValue?: number;
    granularityUnit?: Granularity["unit"];
}

export const LineChart = ({
    data,
    energyConfig,
    height = "400px",
    startDate,
    endDate,
    title,
    granularityMode = "auto",
    granularityValue,
    granularityUnit
}: LineChartProps): React.ReactElement => {
    const { chartData, granularity } = useMemo(() => {
        if (!startDate || !endDate || !data) {
            return { chartData: [], granularity: null };
        }

        const resolvedGranularity: Granularity =
            granularityMode === "strict" && granularityValue && granularityUnit
                ? { value: granularityValue, unit: granularityUnit }
                : getAutoGranularity(startDate, endDate);

        const intervalMs = resolvedGranularity.value * (MENDIX_UNIT_TO_MS[resolvedGranularity.unit] || 0);
        if (intervalMs === 0) {
            return { chartData: [], granularity: resolvedGranularity };
        }

        const dataMap = new Map<number, number>();
        data.forEach(item => {
            const intervalStart = Math.floor(item.timestamp.getTime() / intervalMs) * intervalMs;
            const existingValue = dataMap.get(intervalStart) || 0;
            dataMap.set(intervalStart, existingValue + item.value.toNumber());
        });

        const series = [];
        let currentTime = startDate.getTime();

        while (currentTime <= endDate.getTime()) {
            const intervalStart = Math.floor(currentTime / intervalMs) * intervalMs;
            const value = dataMap.get(intervalStart);
            series.push([currentTime, value !== undefined ? value : null]);
            currentTime += intervalMs;
        }

        return { chartData: series, granularity: resolvedGranularity };
    }, [data, startDate, endDate, granularityMode, granularityValue, granularityUnit]);

    const hasData = useMemo(() => chartData.some(d => d[1] !== null), [chartData]);

    const options: EChartsOption = useMemo(() => {
        const durationHours = (startDate && endDate) ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) : 0;

        return {
            textStyle: {
                fontFamily: "Barlow, sans-serif"
            },
            title: {
                text: title || `Évolution de la consommation ${energyConfig.label.toLowerCase()}`,
                left: "center",
                top: 10,
                textStyle: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif"
                }
            },
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#e2e8f0",
                borderWidth: 1,
                padding: [12, 16],
                className: "linechart-tooltip",
                formatter: (params: any) => {
                    const param = Array.isArray(params) ? params[0] : params;
                    const date = new Date(param.axisValue);
                    const value = param.data[1];

                    const fullDateFormatter = new Intl.DateTimeFormat("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    
                    const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });

                    const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    
                    const displayDate = durationHours <= 48 ? `${dayFormatter.format(date)} ${timeFormatter.format(date)}` : fullDateFormatter.format(date);

                    if (value === null) {
                        return `
                        <div class="tw-text-base">
                            <div class="tw-font-semibold tw-mb-2 tw-text-[#18213e]">
                                ${displayDate}
                            </div>
                            <div class="tw-text-[#6b7280] tw-italic">
                                Aucune donnée
                            </div>
                        </div>`;
                    }

                    return `
                    <div class="tw-text-base">
                        <div class="tw-font-semibold tw-mb-2 tw-text-[#18213e]">
                            ${displayDate}
                        </div>
                        <div class="tw-text-[#18213e] tw-opacity-80">
                            ${(value as number).toFixed(2)} ${energyConfig.unit}
                        </div>
                    </div>`;
                },
                extraCssText:
                    "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; min-width: 200px;"
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                top: "15%",
                containLabel: true
            },
            xAxis: {
                type: "time",
                min: startDate?.getTime(),
                max: endDate?.getTime(),
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: (value: number) => {
                        const date = new Date(value);
                        if (durationHours <= 48) {
                            return new Intl.DateTimeFormat("fr-FR", { hour: '2-digit', minute: '2-digit' }).format(date);
                        }
                        return new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }).format(date);
                    },
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif"
                },
                axisLine: {
                    lineStyle: {
                        color: "#e2e8f0"
                    }
                }
            },
            yAxis: {
                type: "value",
                name: energyConfig.unit,
                nameLocation: "end",
                nameGap: 10,
                nameTextStyle: {
                    color: "#18213e",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "Barlow, sans-serif"
                },
                axisLabel: {
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif"
                },
                axisLine: {
                    lineStyle: {
                        color: "#e2e8f0"
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: "dashed",
                        color: "#e2e8f0"
                    }
                }
            },
            series: [
                {
                    name: "Consommation",
                    type: "line",
                    connectNulls: false, // Ne pas connecter les points `null`
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 6, // Taille réduite pour un look plus clean
                    sampling: "lttb",
                    itemStyle: {
                        color: energyConfig.color,
                        borderWidth: 2,
                        borderColor: "#fff",
                        shadowColor: energyConfig.color,
                        shadowBlur: 4
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 3,
                            shadowBlur: 10
                        }
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: energyConfig.color + "30"
                                },
                                {
                                    offset: 1,
                                    color: energyConfig.color + "05"
                                }
                            ]
                        }
                    },
                    data: chartData
                }
            ],
            animation: true,
            animationDuration: 1000,
            animationEasing: "cubicInOut"
        };
    }, [chartData, energyConfig, title, startDate, endDate, granularity, granularityMode]);

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
