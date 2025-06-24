import { createElement, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts";
import { Big } from "big.js";
import { EnergyConfig } from "../utils/energy";
import { NoDataMessage } from "./NoDataMessage";

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
}

export const LineChart = ({ data, energyConfig, height = "400px", startDate, endDate, title }: LineChartProps): React.ReactElement => {
    const hasData = data && data.length > 0;

    // Filtrer les données selon la plage de dates
    const filteredData = useMemo(() => {
        if (!startDate || !endDate) return data;
        return data.filter(item => 
            item.timestamp >= startDate && 
            item.timestamp <= endDate
        );
    }, [data, startDate, endDate]);

    const options: EChartsOption = useMemo(
        () => ({
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
                    const date = new Date(param.value[0]);
                    const value = param.value[1];

                    const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    return `
                    <div class="tw-text-base">
                        <div class="tw-font-semibold tw-mb-2 tw-text-[#18213e]">
                            ${dateFormatter.format(date)}
                        </div>
                        <div class="tw-text-[#18213e] tw-opacity-80">
                            ${value.toFixed(2)} ${energyConfig.unit}
                        </div>
                    </div>`;
                },
                extraCssText: "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; min-width: 200px;"
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
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: (value: number) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
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
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
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
                    data: hasData ? filteredData.map(item => [item.timestamp.getTime(), item.value.toNumber()]) : []
                }
            ],
            animation: true,
            animationDuration: 1000,
            animationEasing: "cubicInOut"
        }),
        [filteredData, energyConfig, hasData]
    );

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
