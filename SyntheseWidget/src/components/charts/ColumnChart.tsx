import { ReactElement, createElement, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Big } from "big.js";
import { useLoading } from "../services/useLoading";
import { EnergyType } from "../../typings/EnergyTypes";
import { formatSmartValue, BaseUnit } from "../../utils/unitConverter";

export interface SecteurData {
    name: string;
    consoElec: Big;
    consoGaz: Big;
    consoEau: Big;
    consoAir: Big;
    consoElecPrec: Big;
    consoGazPrec: Big;
    consoEauPrec: Big;
    consoAirPrec: Big;
}

interface ColumnChartProps {
    data: SecteurData[];
    title: string;
    type: "elec" | "gaz" | "eau" | "air";
    onClickSecteur?: (secteurName: string) => void;
    baseUnit: BaseUnit;
}

const TYPE_TO_ENERGY_MAP: Record<string, EnergyType> = {
    elec: "electricity",
    gaz: "gas",
    eau: "water",
    air: "air"
};

const ENERGY_CONFIG = {
    elec: { color: "#38a13c", BackgroundIconColor: "rgba(56, 161, 60, 0.1)" },
    gaz: { color: "#F9BE01", BackgroundIconColor: "rgba(249, 190, 1, 0.1)" },
    eau: { color: "#3293f3", BackgroundIconColor: "rgba(50, 147, 243, 0.1)" },
    air: { color: "#66D8E6", BackgroundIconColor: "rgba(102, 216, 230, 0.1)" }
};

const getEnergyType = (type: string): "electricity" | "gas" | "water" | "air" => {
    switch (type) {
        case "elec":
            return "electricity";
        case "gaz":
            return "gas";
        case "eau":
            return "water";
        case "air":
            return "air";
        default:
            return "electricity";
    }
};

const formatValueWithUnit = (
    value: number,
    type: string,
    baseUnit: BaseUnit
): { formattedValue: string; displayUnit: string } => {
    const energyType = getEnergyType(type);
    const bigValue = new Big(value);
    return formatSmartValue(bigValue, energyType, baseUnit);
};

const getCurrentValues = (data: SecteurData[], type: string): number[] => {
    switch (type) {
        case "elec":
            return data.map(d => d.consoElec.toNumber());
        case "gaz":
            return data.map(d => d.consoGaz.toNumber());
        case "eau":
            return data.map(d => d.consoEau.toNumber());
        case "air":
            return data.map(d => d.consoAir.toNumber());
        default:
            return [];
    }
};

const getPreviousValues = (data: SecteurData[], type: string): number[] => {
    switch (type) {
        case "elec":
            return data.map(d => d.consoElecPrec.toNumber());
        case "gaz":
            return data.map(d => d.consoGazPrec.toNumber());
        case "eau":
            return data.map(d => d.consoEauPrec.toNumber());
        case "air":
            return data.map(d => d.consoAirPrec.toNumber());
        default:
            return [];
    }
};

const calculateVariation = (current: number, previous: number): number =>
    previous === 0 ? 0 : ((current - previous) / previous) * 100;

export const ColumnChart = ({ data, title, type, onClickSecteur, baseUnit }: ColumnChartProps): ReactElement => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const { startLoading } = useLoading();

    const calculateLabelConfig = (dataLength: number, containerWidth: number) => {
        const isMobile = window.innerWidth < 640;
        const availableWidth = containerWidth * (isMobile ? 0.7 : 0.85);
        const spacePerLabel = availableWidth / dataLength;
        if (dataLength <= 4)
            return {
                rotate: 0,
                interval: 0,
                width: isMobile ? 80 : 120,
                align: "center",
                fontSize: 12,
                overflow: "none"
            };
        if (dataLength <= 8 && spacePerLabel > 60)
            return {
                rotate: isMobile ? 30 : 0,
                interval: 0,
                width: isMobile ? 70 : 100,
                align: isMobile ? "right" : "center",
                fontSize: isMobile ? 11 : 12,
                overflow: "truncate"
            };
        if (dataLength <= 12 && spacePerLabel > 40)
            return {
                rotate: isMobile ? 45 : 30,
                interval: 0,
                width: isMobile ? 60 : 80,
                align: "right",
                fontSize: isMobile ? 10 : 11,
                overflow: "truncate"
            };
        if (dataLength <= 20) {
            const interval = Math.ceil(dataLength / (isMobile ? 6 : 10)) - 1;
            return {
                rotate: 45,
                interval,
                width: isMobile ? 50 : 70,
                align: "right",
                fontSize: isMobile ? 9 : 10,
                overflow: "truncate"
            };
        }
        const interval = Math.ceil(dataLength / (isMobile ? 4 : 8)) - 1;
        return { rotate: 60, interval, width: isMobile ? 40 : 60, align: "right", fontSize: 9, overflow: "truncate" };
    };

    const truncateLabel = (label: string, maxLength: number): string => {
        if (label.length <= maxLength) return label;
        if (maxLength > 6) {
            const start = Math.ceil((maxLength - 3) / 2);
            const end = Math.floor((maxLength - 3) / 2);
            return `${label.substring(0, start)}...${label.substring(label.length - end)}`;
        }
        return `${label.substring(0, maxLength - 3)}...`;
    };

    useEffect(() => {
        const initChart = () => {
            if (!chartRef.current) return;
            if (!chartInstance.current) chartInstance.current = echarts.init(chartRef.current);

            const currentValues = getCurrentValues(data, type);
            const previousValues = getPreviousValues(data, type);
            const sampleValue = currentValues.length > 0 ? currentValues[0] : 0;
            const sampleFormatted = formatValueWithUnit(sampleValue, type, baseUnit);
            const displayUnit = sampleFormatted.displayUnit;
            const color = (ENERGY_CONFIG as any)[type].color;
            const isMobile = window.innerWidth < 640;
            const isClickable = !!onClickSecteur;
            const containerWidth = chartRef.current?.offsetWidth || 400;
            const labelConfig = calculateLabelConfig(data.length, containerWidth);
            const needsExtraBottomSpace = (labelConfig.rotate as number) > 30;
            const bottomSpacing = needsExtraBottomSpace ? (isMobile ? "25%" : "20%") : isMobile ? "20%" : "15%";

            const option = {
                title: {
                    text: title,
                    left: "center",
                    top: 0,
                    textStyle: { fontSize: 16, fontWeight: 600, color: "#111827" }
                },
                tooltip: {
                    trigger: "axis",
                    className: "echarts-tooltip",
                    renderMode: "html",
                    formatter: (params: any[]) => {
                        const currentValue = params[1].value;
                        const previousValue = params[0].value;
                        const variation = calculateVariation(currentValue, previousValue);
                        const variationColor = variation > 8 ? "#ef4444" : variation < 0 ? "#22c55e" : "#64748b";
                        const formattedCurrent = formatValueWithUnit(currentValue, type, baseUnit);
                        const formattedPrevious = formatValueWithUnit(previousValue, type, baseUnit);
                        const clickMessage = isClickable
                            ? `<div class="mt-2 text-blue-600 font-bold">Cliquez pour voir les détails</div>`
                            : "";
                        return `
                            <div class="font-medium">
                                <div class="text-lg mb-2 font-bold">${params[0].name}</div>
                                <div>Période actuelle: ${formattedCurrent.formattedValue} ${
                            formattedCurrent.displayUnit
                        }</div>
                                <div>Période précédente: ${formattedPrevious.formattedValue} ${
                            formattedPrevious.displayUnit
                        }</div>
                                <div style="color: ${variationColor}">Variation: ${
                            variation > 0 ? "+" : ""
                        }${variation.toFixed(1)}%</div>
                                ${clickMessage}
                            </div>
                        `;
                    }
                },
                legend: {
                    data: ["Période précédente", "Période actuelle"],
                    top: 30,
                    textStyle: { fontSize: 12, fontWeight: 500 }
                },
                grid: {
                    top: 80,
                    left: isMobile ? "15%" : "5%",
                    right: "5%",
                    bottom: bottomSpacing,
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: data.map(d => d.name),
                    axisLabel: {
                        fontSize: labelConfig.fontSize,
                        fontWeight: 500,
                        interval: labelConfig.interval,
                        rotate: labelConfig.rotate,
                        width: labelConfig.width,
                        overflow: labelConfig.overflow,
                        align: labelConfig.align,
                        formatter: (value: string) => {
                            if (labelConfig.overflow === "truncate") {
                                const maxLength = Math.floor(
                                    (labelConfig.width as number) / ((labelConfig.fontSize as number) * 0.6)
                                );
                                return truncateLabel(value, maxLength);
                            }
                            return value;
                        }
                    }
                },
                yAxis: {
                    type: "value",
                    name: displayUnit,
                    nameTextStyle: { fontSize: 12, fontWeight: 500, padding: [0, 0, 0, 30] },
                    axisLabel: { fontSize: 12, fontWeight: 500, formatter: `{value} ${displayUnit}` },
                    splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } }
                },
                series: [
                    {
                        name: "Période précédente",
                        type: "bar",
                        data: previousValues,
                        itemStyle: { color, opacity: 0.3 },
                        emphasis: { itemStyle: { opacity: 0.5 } },
                        barWidth: "20%",
                        z: 1
                    },
                    {
                        name: "Période actuelle",
                        type: "bar",
                        data: currentValues,
                        itemStyle: { color, borderWidth: isClickable ? 1 : 0, borderColor: "transparent" },
                        emphasis: {
                            itemStyle: {
                                color,
                                opacity: 1,
                                borderWidth: isClickable ? 2 : 0,
                                borderColor: isClickable ? "#1f2937" : "transparent",
                                shadowBlur: 10,
                                shadowColor: color
                            }
                        },
                        barWidth: "20%",
                        barGap: "10%",
                        z: 2
                    }
                ]
            } as any;

            chartInstance.current.setOption(option);
            if (isClickable) {
                chartInstance.current.getZr().on("mousemove", (params: any) => {
                    const pointInPixel = [params.offsetX, params.offsetY];
                    if (chartInstance.current?.containPixel("grid", pointInPixel)) {
                        chartRef.current!.style.cursor = "pointer";
                    } else {
                        chartRef.current!.style.cursor = "default";
                    }
                });
                chartInstance.current.getZr().on("mouseout", () => {
                    chartRef.current!.style.cursor = "default";
                });
            }
            if (onClickSecteur) {
                chartInstance.current.on("click", params => {
                    if (params.componentType === "series") {
                        const secteurName = params.name;
                        const energyType = TYPE_TO_ENERGY_MAP[type];
                        const loadingMessage = `Chargement des détails pour ${secteurName}...`;
                        startLoading(loadingMessage, false, energyType);
                        onClickSecteur(secteurName);
                    }
                });
            }
        };

        const timer = setTimeout(initChart, 100);
        const handleResize = () => {
            if (chartInstance.current) {
                chartInstance.current.resize();
                const containerWidth = chartRef.current?.offsetWidth || 400;
                const labelConfig = calculateLabelConfig(data.length, containerWidth);
                const needsExtraBottomSpace = (labelConfig.rotate as number) > 30;
                const isMobile = window.innerWidth < 640;
                const bottomSpacing = needsExtraBottomSpace ? (isMobile ? "25%" : "20%") : isMobile ? "20%" : "15%";
                chartInstance.current.setOption({
                    grid: { left: isMobile ? "15%" : "5%", bottom: bottomSpacing },
                    xAxis: {
                        axisLabel: {
                            fontSize: labelConfig.fontSize,
                            interval: labelConfig.interval,
                            rotate: labelConfig.rotate,
                            width: labelConfig.width,
                            overflow: labelConfig.overflow,
                            align: labelConfig.align,
                            formatter: (value: string) => {
                                if (labelConfig.overflow === "truncate") {
                                    const maxLength = Math.floor(
                                        (labelConfig.width as number) / ((labelConfig.fontSize as number) * 0.6)
                                    );
                                    return truncateLabel(value, maxLength);
                                }
                                return value;
                            }
                        }
                    }
                });
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", handleResize);
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [data, title, type, onClickSecteur, startLoading, baseUnit]);

    return (
        <div className="card-base">
            <div ref={chartRef} className="chart-container" />
            {onClickSecteur && (
                <div className="text-center text-sm text-secondary mt-2 italic">
                    Survolez et cliquez sur un secteur pour voir plus de détails
                    {data.length > 12 && (
                        <span className="block text-xs mt-1 text-secondary">
                            Tous les secteurs ne sont pas affichés sur l'axe - utilisez les tooltips pour voir les
                            détails
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
