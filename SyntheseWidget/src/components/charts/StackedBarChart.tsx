import { ReactElement, createElement, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Big } from "big.js";
import { BaseUnit, formatSmartValue } from "../../utils/unitConverter";

export interface StackedDataItem {
    name: string;
    consoElec: Big;
    consoGaz: Big;
    consoEau: Big;
    consoAir: Big;
}

interface StackedBarChartProps {
    data: StackedDataItem[];
    title: string;
    baseUnitElectricity: BaseUnit;
    baseUnitGas: BaseUnit;
    baseUnitWater: BaseUnit;
    baseUnitAir: BaseUnit;
}

const SERIES_CONFIG = [
    { key: "consoElec", label: "Électricité", color: "#38a13c", unit: "electricity" as const },
    { key: "consoGaz", label: "Gaz", color: "#F9BE01", unit: "gas" as const },
    { key: "consoEau", label: "Eau", color: "#3293f3", unit: "water" as const },
    { key: "consoAir", label: "Air", color: "#66D8E6", unit: "air" as const }
];

export const StackedBarChart = ({
    data,
    title,
    baseUnitElectricity,
    baseUnitGas,
    baseUnitWater,
    baseUnitAir
}: StackedBarChartProps): ReactElement => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const levelNames = data.map(d => d.name);
        const getUnitForSeries = (seriesKey: string): BaseUnit => {
            switch (seriesKey) {
                case "consoElec":
                    return baseUnitElectricity;
                case "consoGaz":
                    return baseUnitGas;
                case "consoEau":
                    return baseUnitWater;
                case "consoAir":
                    return baseUnitAir;
                default:
                    return baseUnitElectricity;
            }
        };

        const series = SERIES_CONFIG.map(cfg => ({
            name: cfg.label,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: { color: cfg.color },
            data: data.map(d => (d as any)[cfg.key].toNumber())
        }));

        // Tooltip formatting with units per series
        const option = {
            title: {
                text: title,
                left: "center",
                top: 0,
                textStyle: { fontSize: 16, fontWeight: 600, color: "#111827" }
            },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any[]) => {
                    const name = params?.[0]?.axisValueLabel || "";
                    let html = `<div class="font-medium"><div class="text-lg mb-2 font-bold">${name}</div>`;
                    params.forEach(p => {
                        const cfg = SERIES_CONFIG.find(c => c.label === p.seriesName);
                        if (!cfg) return;
                        const baseUnit = getUnitForSeries(cfg.key);
                        const formatted = formatSmartValue(new Big(p.value || 0), cfg.unit, baseUnit);
                        html += `<div><span style="display:inline-block;width:10px;height:10px;background:${cfg.color};margin-right:6px;border-radius:2px"></span>${cfg.label}: ${formatted.formattedValue} ${formatted.displayUnit}</div>`;
                    });
                    html += `</div>`;
                    return html;
                }
            },
            legend: { data: SERIES_CONFIG.map(s => s.label), top: 30, textStyle: { fontSize: 12, fontWeight: 500 } },
            grid: { top: 70, left: "6%", right: "6%", bottom: "8%", containLabel: true },
            xAxis: { type: "category", data: levelNames, axisLabel: { fontSize: 12, fontWeight: 500 } },
            yAxis: { type: "value", axisLabel: { fontSize: 12, fontWeight: 500 } },
            series
        } as any;

        chartInstance.current.setOption(option);
        const handleResize = () => chartInstance.current?.resize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [data, title, baseUnitElectricity, baseUnitGas, baseUnitWater, baseUnitAir]);

    return (
        <div className="card-base">
            <div ref={chartRef} className="chart-container" />
        </div>
    );
};
