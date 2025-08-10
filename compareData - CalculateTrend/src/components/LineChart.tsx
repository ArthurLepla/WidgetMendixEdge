import { ReactElement, createElement, useEffect, useRef, memo } from "react";
import * as echarts from "echarts";
import Big from "big.js";
import { getColorForName } from "../utils/colorUtils";
import { NoData } from "./NoData";
import { EnergyType } from "../utils/types";
import { getUnit } from "../utils/energyConfig";

export interface MachineData {
    name: string;
    timestamps: Date[];
    values: Big[];
}

interface LineChartProps {
    data: MachineData[];
    type: EnergyType;
    viewMode: "energetic" | "ipe";
    onAddProductionClick?: () => void; // Action Mendix pour rediriger vers la page de saisie de production
}

// Constants de style
const CHART_STYLES = {
    CHART_HEIGHT: '500px',
    FONT_SIZES: {
        TITLE: 16,
        LEGEND: 14,
        TOOLTIP: 14,
        AXIS: 12
    },
    COLORS: {
        TEXT_DARK: '#111827',
        GRID_LINES: '#E5E7EB'
    },
    MARGINS: {
        AXIS: 14,
        Y_AXIS: 16
    },
    LINE_WIDTH: {
        DEFAULT: 3,
        EMPHASIS: 4
    },
    SYMBOL_SIZE: 6
};

// Formatage de date pour l'affichage
const formatDate = (date: Date, includeYear: boolean = false): string => {
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        ...(includeYear && { year: 'numeric' }),
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Formatage du contenu des tooltips
const formatTooltip = (params: any[], unit: string): string => {
    const timestamp = new Date(params[0].axisValue);
    const formattedDate = formatDate(timestamp, true);
    
    let tooltipContent = `<div style="font-weight: bold; font-size: ${CHART_STYLES.FONT_SIZES.TOOLTIP}px; margin-bottom: 8px">${formattedDate}</div>`;
    params.forEach(param => {
        tooltipContent += `
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: ${CHART_STYLES.FONT_SIZES.TOOLTIP}px">
                <span style="color: ${param.color}; margin-right: 15px">${param.seriesName}:</span>
                <span style="font-weight: bold">
                    ${param.value[1].toFixed(1)} ${unit}
                </span>
            </div>
        `;
    });
    return tooltipContent;
};

// Fonction pour créer la configuration du graphique
const createChartOptions = (data: MachineData[], viewMode: "energetic" | "ipe", unit: string) => {
    return {
        title: {
            text: viewMode === "ipe" ? `Évolution des IPE (${unit})` : `Évolution des consommations (${unit})`,
            left: 'center',
            top: 0,
            textStyle: {
                fontSize: CHART_STYLES.FONT_SIZES.TITLE,
                fontWeight: 600,
                color: CHART_STYLES.COLORS.TEXT_DARK
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985',
                    fontSize: CHART_STYLES.FONT_SIZES.TOOLTIP
                }
            },
            textStyle: {
                fontSize: CHART_STYLES.FONT_SIZES.TOOLTIP
            },
            formatter: (params: any[]) => formatTooltip(params, unit)
        },
        legend: {
            data: data.map(d => d.name),
            top: 40,
            textStyle: {
                fontSize: CHART_STYLES.FONT_SIZES.LEGEND
            }
        },
        grid: {
            left: '10%',
            right: '5%',
            bottom: '12%',
            top: 100,
            containLabel: true
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                formatter: (value: number) => {
                    const date = new Date(value);
                    return formatDate(date);
                },
                fontSize: CHART_STYLES.FONT_SIZES.AXIS,
                rotate: 30,
                margin: CHART_STYLES.MARGINS.AXIS
            }
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameLocation: 'end',
            nameGap: 15,
            nameTextStyle: {
                fontSize: CHART_STYLES.FONT_SIZES.LEGEND,
                fontWeight: 500,
                padding: [0, 0, 0, 50]
            },
            axisLabel: {
                formatter: `{value} ${unit}`,
                fontSize: CHART_STYLES.FONT_SIZES.AXIS,
                margin: CHART_STYLES.MARGINS.Y_AXIS
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: CHART_STYLES.COLORS.GRID_LINES
                }
            }
        },
        series: data.map((machine) => ({
            name: machine.name,
            type: 'line',
            symbol: 'circle',
            symbolSize: CHART_STYLES.SYMBOL_SIZE,
            sampling: 'lttb',
            data: machine.timestamps.map((timestamp, i) => [
                timestamp.getTime(),
                machine.values[i].toNumber()
            ]),
            emphasis: {
                focus: 'series',
                lineStyle: {
                    width: CHART_STYLES.LINE_WIDTH.EMPHASIS
                }
            },
            lineStyle: {
                width: CHART_STYLES.LINE_WIDTH.DEFAULT,
                color: getColorForName(machine.name)
            },
            itemStyle: {
                color: getColorForName(machine.name)
            }
        }))
    };
};

// Composant pour afficher un message avec une icône et un bouton d'action
const EmptyDataMessage = ({ title, message, buttonText, onClick }: { 
    title: string;
    message: string;
    buttonText?: string;
    onClick?: () => void;
}): ReactElement => {
    return (
        <div className="card-base">
            <div className="flex flex-col items-center justify-center p-8 text-center" style={{ height: CHART_STYLES.CHART_HEIGHT, color: CHART_STYLES.COLORS.TEXT_DARK }}>
                <div className="mb-4 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                {buttonText && onClick && (
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded inline-flex items-center"
                        onClick={onClick}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

// Fonction de comparaison personnalisée pour React.memo
const arePropsEqual = (prevProps: LineChartProps, nextProps: LineChartProps): boolean => {
    // Vérifier si le type ou le mode d'affichage a changé
    if (prevProps.type !== nextProps.type || prevProps.viewMode !== nextProps.viewMode) {
        return false;
    }
    
    // Vérifier si le nombre de séries de données a changé
    if (prevProps.data.length !== nextProps.data.length) {
        return false;
    }
    
    // Comparaison approfondie des séries de données
    for (let i = 0; i < prevProps.data.length; i++) {
        const prevMachine = prevProps.data[i];
        const nextMachine = nextProps.data[i];
        
        // Vérifier si le nom a changé
        if (prevMachine.name !== nextMachine.name) {
            return false;
        }
        
        // Vérifier si le nombre de points de données a changé
        if (prevMachine.timestamps.length !== nextMachine.timestamps.length) {
            return false;
        }
        
        // Pour les grands ensembles de données, on pourrait se contenter de vérifier 
        // uniquement le premier et le dernier point pour des raisons de performance
        // mais ici nous comparons tous les points pour une précision maximale
        for (let j = 0; j < prevMachine.timestamps.length; j++) {
            if (prevMachine.timestamps[j].getTime() !== nextMachine.timestamps[j].getTime() ||
                !prevMachine.values[j].eq(nextMachine.values[j])) {
                return false;
            }
        }
    }
    
    return true;
};

const LineChartComponent = ({ data, type, viewMode, onAddProductionClick }: LineChartProps): ReactElement => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const unit = getUnit(type, viewMode);

    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const option = createChartOptions(data, viewMode, unit);
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
    }, [data, type, viewMode, unit]);

    if (data.length === 0) {
        if (viewMode === "ipe") {
            return (
                <EmptyDataMessage 
                    title="Aucun indicateur de performance énergétique disponible"
                    message="Aucune donnée de production n'est disponible pour la période ou les machines sélectionnées. Veuillez saisir des données de production pour calculer les IPE."
                    buttonText={onAddProductionClick ? "Saisir des données de production" : undefined}
                    onClick={onAddProductionClick}
                />
            );
        }
        
        return <NoData message={`Aucune donnée de consommation disponible (${unit})`} />;
    }

    return (
        <div className="card-base">
            <div ref={chartRef} style={{ width: '100%', height: CHART_STYLES.CHART_HEIGHT }} />
        </div>
    );
};

// Exporter le composant mémoïsé
export const LineChart = memo(LineChartComponent, arePropsEqual); 