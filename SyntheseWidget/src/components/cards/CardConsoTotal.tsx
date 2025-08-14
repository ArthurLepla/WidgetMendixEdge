import { ReactElement, createElement, useEffect, useRef } from "react";
import { Zap, Flame, Droplet, Wind } from "lucide-react";
import { Big } from "big.js";
import * as echarts from "echarts";
import { formatSmartValue, BaseUnit } from "../../utils/unitConverter";
import { EnergyType } from "../../typings/EnergyTypes";

export interface CardConsoTotalProps {
    title: string;
    currentValue: Big;
    previousValue: Big;
    type: EnergyType;
    baseUnit: BaseUnit;
}

const ENERGY_CONFIG = {
    electricity: {
        color: "#38a13c",
        iconColor: "#38a13c",
        titleColor: "#38a13c",
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)"
    },
    gas: {
        color: "#F9BE01",
        iconColor: "#F9BE01",
        titleColor: "#F9BE01",
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)"
    },
    water: {
        color: "#3293f3",
        iconColor: "#3293f3",
        titleColor: "#3293f3",
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)"
    },
    air: {
        color: "#66D8E6",
        iconColor: "#66D8E6",
        titleColor: "#66D8E6",
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)"
    }
};

const getIcon = (type: string, className: string): ReactElement => {
    const config = ENERGY_CONFIG[type as keyof typeof ENERGY_CONFIG];
    switch (type) {
        case "electricity":
            return <Zap className={className} style={{ color: config.iconColor }} />;
        case "gas":
            return <Flame className={className} style={{ color: config.iconColor }} />;
        case "water":
            return <Droplet className={className} style={{ color: config.iconColor }} />;
        case "air":
            return <Wind className={className} style={{ color: config.iconColor }} />;
        default:
            return <Zap className={className} style={{ color: config.iconColor }} />;
    }
};

const calculateVariation = (current: Big, previous: Big): number => {
    if (previous.eq(0)) return 0;
    return current.minus(previous).div(previous).mul(100).toNumber();
};

const generateTrendData = (previousValue: Big | null, currentValue: Big | null): number[] => {
    if (!previousValue || !currentValue) {
        return Array(15).fill(0);
    }

    const start = previousValue.toNumber();
    const end = currentValue.toNumber();
    if (start === 0 && end === 0) {
        return Array(15).fill(0);
    }

    const points = 15;
    return Array.from({ length: points }, (_, i) => {
        const progress = i / (points - 1);
        const smoothProgress = progress * progress * (3 - 2 * progress);
        const baseValue = start + (end - start) * smoothProgress;
        const maxVariation = Math.abs(end - start) * 0.08;
        const variation = Math.sin(progress * Math.PI) * maxVariation * (Math.random() * 0.5 + 0.5);
        return Math.max(0, baseValue + variation);
    });
};

export const CardConsoTotal = ({
    title,
    currentValue,
    previousValue,
    type,
    baseUnit
}: CardConsoTotalProps): ReactElement => {
    const sparklineRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const hasData = currentValue !== null && previousValue !== null;
    const variation = hasData ? calculateVariation(currentValue, previousValue) : 0;
    const isPositive = variation > 0;
    const isSignificant = Math.abs(variation) > 8;
    const config = ENERGY_CONFIG[type];

    const formattedCurrentValue = hasData
        ? formatSmartValue(currentValue, type, baseUnit)
        : { formattedValue: "N/A", displayUnit: "N/A" };

    useEffect(() => {
        const initChart = () => {
            if (!sparklineRef.current) return;
            if (!chartInstance.current) {
                chartInstance.current = echarts.init(sparklineRef.current);
            }

            const trendData = generateTrendData(previousValue, currentValue);
            const minValue = Math.min(...trendData);
            const maxValue = Math.max(...trendData);
            const hasNoData = !hasData || (currentValue.eq(0) && previousValue.eq(0));

            const option = {
                animation: false,
                grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
                xAxis: { type: "category", show: false, boundaryGap: false },
                yAxis: {
                    type: "value",
                    show: false,
                    min: hasNoData ? 0 : minValue * 0.95,
                    max: hasNoData ? 0.2 : maxValue * 1.05,
                    scale: !hasNoData
                },
                series: [
                    {
                        type: "line",
                        data: trendData,
                        showSymbol: false,
                        symbol: "none",
                        smooth: true,
                        lineStyle: { width: hasNoData ? 1 : 2, color: config.color },
                        areaStyle: {
                            opacity: 1,
                            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: config.color + (hasNoData ? "10" : "30") },
                                { offset: 0.5, color: config.color + (hasNoData ? "08" : "15") },
                                { offset: 1, color: config.color + (hasNoData ? "05" : "05") }
                            ])
                        }
                    }
                ]
            } as any;

            chartInstance.current.setOption(option);
        };

        const timer = setTimeout(initChart, 100);
        const handleResize = () => chartInstance.current?.resize();
        window.addEventListener("resize", handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", handleResize);
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [currentValue?.toString(), previousValue?.toString(), type, config.color, hasData]);

    return (
        <div className={`card-base ${isSignificant && isPositive ? "bg-red-50" : ""}`}>
            <div className="flex items-center gap-4">
                <div className="icon-container" style={{ backgroundColor: config.BackgroundIconColor }}>
                    {getIcon(type, "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14")}
                </div>
                <h3 className="title-medium flex-1">{title}</h3>
            </div>
            <div className="mt-4">
                <div className="value-large" style={{ color: config.color }}>
                    {hasData ? formattedCurrentValue.formattedValue : "N/A"}{" "}
                    {hasData ? formattedCurrentValue.displayUnit : ""}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    {hasData ? (
                        <div className="flex items-center gap-2">
                            <div
                                className={`px-2 py-1 rounded-lg font-medium ${
                                    isPositive
                                        ? isSignificant
                                            ? "text-red-700 bg-red-100"
                                            : "text-gray-700 bg-gray-100"
                                        : "text-green-700 bg-green-100"
                                }`}
                            >
                                {variation > 0 ? "+" : ""}
                                {variation.toFixed(1)}%
                            </div>
                            <span className="text-gray-500">vs période précédente</span>
                        </div>
                    ) : (
                        <span className="text-gray-500">Aucune donnée disponible</span>
                    )}
                </div>
                <div ref={sparklineRef} className="w-full h-12 mt-2" />
            </div>
        </div>
    );
};
