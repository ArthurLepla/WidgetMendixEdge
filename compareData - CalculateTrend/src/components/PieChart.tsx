import { ReactElement, createElement, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Big } from "big.js";
import { getColorForName } from "../utils/colorUtils";
import { NoData } from "./NoData";
import { EnergyType } from "../utils/energy";
import { getUnitForEnergyAndMetric, getMetricTypeFromViewMode } from "../utils/energy";
import { getSmartUnit, getBaseValueForComparison } from "../utils/unitConverter";

interface PieChartProps {
    machines: {
        name: string;
        currentValue?: Big;
        sumValue: Big;
    }[];
    type: EnergyType;
    viewMode: "energetic" | "ipe";
    unit?: string; // Unité personnalisée (prioritaire sur getUnit)
}

const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

export const PieChart = ({ machines, type, viewMode, unit: customUnit }: PieChartProps): ReactElement => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
            const unit = customUnit || getUnitForEnergyAndMetric(type, getMetricTypeFromViewMode(viewMode));
    
    const total = machines.reduce((sum, machine) => sum.plus(machine.sumValue), new Big(0));
    const smartTotal = getSmartUnit(total, type, viewMode);

    useEffect(() => {
        if (!chartRef.current || machines.length === 0 || total.eq(0)) return;

        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const data = machines.map(machine => {
            // En mode IPE, on force l'utilisation de l'unité fournie par le container (kWh/kg ou kWh/pcs)
            const smartValue = viewMode === "ipe" 
                ? { value: machine.sumValue.toNumber(), unit }
                : getSmartUnit(machine.sumValue, type, viewMode);

            // Calculer le pourcentage basé sur les valeurs en unité de base (brutes)
            // Cela évite les problèmes de comparaison entre différentes unités converties
            const baseValue = getBaseValueForComparison(machine.sumValue);
            const baseTotal = getBaseValueForComparison(total);
            const percentage = baseTotal === 0 ? 0 : (baseValue / baseTotal) * 100;

            return {
                name: machine.name,
                originalValue: machine.sumValue.toNumber(), // Garder la valeur originale pour référence
                value: machine.sumValue.toNumber(), // Utiliser la valeur originale pour les calculs ECharts
                displayValue: smartValue.value, // Valeur convertie pour l'affichage dans les tooltips
                unit: smartValue.unit, // Unité convertie
                percentage: percentage, // Pourcentage basé sur les valeurs de base
                itemStyle: {
                    color: getColorForName(machine.name)
                }
            };
        });

        const option = {
            title: {
                text: viewMode === "ipe" ? `Répartition des sommes d'IPE (${unit})` : `Répartition des sommes de consommation (${smartTotal.unit})`,
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#111827'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `
                        <div style="font-size: 14px;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
                            <div>${viewMode === "ipe" ? "Somme IPE" : "Somme Consommation"}: ${params.data.displayValue.toFixed(1)} ${params.data.unit}</div>
                            <div>Pourcentage: ${params.data.percentage.toFixed(1)}%</div>
                        </div>
                    `;
                },
                textStyle: {
                    fontSize: 14
                }
            },
            legend: {
                type: 'scroll',
                orient: 'horizontal',
                bottom: 20,
                left: 'center',
                itemWidth: 15,
                itemHeight: 15,
                textStyle: {
                    fontSize: 12,
                    overflow: 'truncate',
                    width: 120
                },
                formatter: (name: string) => {
                    const item = data.find(d => d.name === name);
                    return item ? `${truncateText(name)} (${item.percentage.toFixed(1)}%)` : name;
                },
                tooltip: {
                    show: true,
                    formatter: (params: any) => {
                        const item = data.find(d => d.name === params.name);
                        return item ? `${params.name}\n${item.percentage.toFixed(1)}%` : params.name;
                    }
                },
                pageButtonItemGap: 5,
                pageButtonGap: 5,
                pageButtonPosition: 'end',
                pageFormatter: '{current}/{total}',
                pageIconColor: '#111827',
                pageIconInactiveColor: '#999',
                pageIconSize: 15,
                pageTextStyle: {
                    color: '#111827'
                }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: false
                    }
                },
                data: data
            }]
        };

        chart.setOption(option);

        const handleResize = () => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        // Observe the chart container for resize events
        let resizeObserver: ResizeObserver;
        if (chartRef.current) {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            // Disconnect the observer
            if (resizeObserver && chartRef.current) {
                resizeObserver.unobserve(chartRef.current);
            }
            if (chartInstance.current && !chartInstance.current.isDisposed()) { // Check if disposed
                chartInstance.current.dispose();
            }
        };
    }, [machines, type, viewMode, unit, total, smartTotal]);

    if (machines.length === 0 || total.eq(0)) {
        return <NoData message={viewMode === "ipe" 
            ? `Aucun indicateur de performance énergétique à afficher (${unit})`
            : `Aucune donnée de consommation disponible (${unit})`} 
        />;
    }

    return (
        <div className="card-base">
            <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
        </div>
    );
}; 