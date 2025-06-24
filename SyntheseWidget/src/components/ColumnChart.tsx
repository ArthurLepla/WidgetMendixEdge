import { ReactElement, createElement, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Big } from "big.js";
import { useLoading } from "./services/useLoading";
import { EnergyType } from "../typings/EnergyTypes";
import { formatSmartValue, BaseUnit } from "../utils/unitConverter";

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
    type: 'elec' | 'gaz' | 'eau' | 'air';
    onClickSecteur?: (secteurName: string) => void;
    baseUnit?: BaseUnit;
}

// Mappage entre les types de graphique et les types d'énergie
const TYPE_TO_ENERGY_MAP: Record<string, EnergyType> = {
    'elec': 'electricity',
    'gaz': 'gas',
    'eau': 'water',
    'air': 'air'
};

const ENERGY_CONFIG = {
    elec: {
        color: '#38a13c',
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)"
    },
    gaz: {
        color: '#F9BE01',
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)"
    },
    eau: {
        color: '#3293f3',
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)"
    },
    air: {
        color: '#66D8E6',
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)"
    }
};

// Fonctions utilitaires adaptées au nouveau système d'unités
const getEnergyType = (type: string): "electricity" | "gas" | "water" | "air" => {
    switch (type) {
        case 'elec':
            return 'electricity';
        case 'gaz':
            return 'gas';
        case 'eau':
            return 'water';
        case 'air':
            return 'air';
        default:
            return 'electricity';
    }
};

// Formatage des valeurs pour affichage avec le nouveau système
const formatValueWithUnit = (value: number, type: string, baseUnit: BaseUnit = "auto"): { formattedValue: string, displayUnit: string } => {
    const energyType = getEnergyType(type);
    const bigValue = new Big(value);
    return formatSmartValue(bigValue, energyType, baseUnit);
};

const getCurrentValues = (data: SecteurData[], type: string): number[] => {
    switch (type) {
        case 'elec':
            return data.map(d => d.consoElec.toNumber());
        case 'gaz':
            return data.map(d => d.consoGaz.toNumber());
        case 'eau':
            return data.map(d => d.consoEau.toNumber());
        case 'air':
            return data.map(d => d.consoAir.toNumber());
        default:
            return [];
    }
};

const getPreviousValues = (data: SecteurData[], type: string): number[] => {
    switch (type) {
        case 'elec':
            return data.map(d => d.consoElecPrec.toNumber());
        case 'gaz':
            return data.map(d => d.consoGazPrec.toNumber());
        case 'eau':
            return data.map(d => d.consoEauPrec.toNumber());
        case 'air':
            return data.map(d => d.consoAirPrec.toNumber());
        default:
            return [];
    }
};

const calculateVariation = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export const ColumnChart = ({ data, title, type, onClickSecteur, baseUnit = "auto" }: ColumnChartProps): ReactElement => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    // Suppression de l'état hoveredIndex qui n'est pas utilisé activement
    
    // Utiliser le hook de chargement, en ne récupérant que startLoading qui est utilisé
    const { startLoading } = useLoading();

    useEffect(() => {
        const initChart = () => {
            if (!chartRef.current) return;

            if (!chartInstance.current) {
                chartInstance.current = echarts.init(chartRef.current);
            }

            const currentValues = getCurrentValues(data, type);
            const previousValues = getPreviousValues(data, type);
            // Obtenir une unité d'exemple pour l'affichage de l'axe Y
            const sampleValue = currentValues.length > 0 ? currentValues[0] : 0;
            const sampleFormatted = formatValueWithUnit(sampleValue, type, baseUnit);
            const displayUnit = sampleFormatted.displayUnit;
            const color = ENERGY_CONFIG[type].color;
            const isMobile = window.innerWidth < 640;
            const isClickable = !!onClickSecteur;

            const option = {
                title: {
                    text: title,
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#111827'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any[]) => {
                        const currentValue = params[1].value;
                        const previousValue = params[0].value;
                        const variation = calculateVariation(currentValue, previousValue);
                        const variationColor = variation > 8 ? '#ef4444' : variation < 0 ? '#22c55e' : '#64748b';
                        
                        // Utiliser la fonction formatValueWithUnit pour les valeurs
                        const formattedCurrent = formatValueWithUnit(currentValue, type, baseUnit);
                        const formattedPrevious = formatValueWithUnit(previousValue, type, baseUnit);
                        
                        // Ajout d'un message pour indiquer que le secteur est cliquable
                        const clickMessage = isClickable 
                            ? `<div class="mt-2 text-blue-600 font-bold">Cliquez pour voir les détails</div>` 
                            : '';
                        
                        return `
                            <div class="font-medium">
                                <div class="text-lg mb-2 font-bold">${params[0].name}</div>
                                <div>Période actuelle: ${formattedCurrent.formattedValue} ${formattedCurrent.displayUnit}</div>
                                <div>Période précédente: ${formattedPrevious.formattedValue} ${formattedPrevious.displayUnit}</div>
                                <div style="color: ${variationColor}">
                                    Variation: ${variation > 0 ? '+' : ''}${variation.toFixed(1)}%
                                </div>
                                ${clickMessage}
                            </div>
                        `;
                    }
                },
                legend: {
                    data: ['Période précédente', 'Période actuelle'],
                    top: 30,
                    textStyle: {
                        fontSize: 12,
                        fontWeight: 500
                    }
                },
                grid: {
                    top: 80,
                    left: isMobile ? '15%' : '5%',
                    right: '5%',
                    bottom: isMobile ? '20%' : '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: data.map(d => d.name),
                    axisLabel: {
                        fontSize: 12,
                        fontWeight: 500,
                        interval: 0,
                        rotate: isMobile ? 45 : 0,
                        width: isMobile ? 60 : 100,
                        overflow: 'truncate',
                        align: isMobile ? 'right' : 'center'
                    }
                },
                yAxis: {
                    type: 'value',
                    name: displayUnit,
                    nameTextStyle: {
                        fontSize: 12,
                        fontWeight: 500,
                        padding: [0, 0, 0, 30]
                    },
                    axisLabel: {
                        fontSize: 12,
                        fontWeight: 500,
                        formatter: `{value} ${displayUnit}`
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#e5e7eb'
                        }
                    }
                },
                series: [
                    {
                        name: 'Période précédente',
                        type: 'bar',
                        data: previousValues,
                        itemStyle: {
                            color,
                            opacity: 0.3
                        },
                        emphasis: {
                            itemStyle: {
                                opacity: 0.5
                            }
                        },
                        barWidth: '20%',
                        z: 1
                    },
                    {
                        name: 'Période actuelle',
                        type: 'bar',
                        data: currentValues,
                        itemStyle: {
                            color,
                            // Ajouter une bordure pour indiquer que c'est interactif si un gestionnaire de clic est fourni
                            borderWidth: isClickable ? 1 : 0,
                            borderColor: 'transparent'
                        },
                        emphasis: {
                            // Style accentué au survol
                            itemStyle: {
                                color: color,
                                opacity: 1,
                                // Bordure plus visible et colorée au survol
                                borderWidth: isClickable ? 2 : 0,
                                borderColor: isClickable ? '#1f2937' : 'transparent',
                                // Effet de brillance
                                shadowBlur: 10,
                                shadowColor: color
                            }
                        },
                        barWidth: '20%',
                        barGap: '10%',
                        z: 2
                    }
                ]
            };

            chartInstance.current.setOption(option);
            
            // Ajouter le curseur "pointer" au survol des colonnes
            if (isClickable) {
                chartInstance.current.getZr().on('mousemove', (params: any) => {
                    const pointInPixel = [params.offsetX, params.offsetY];
                    if (chartInstance.current?.containPixel('grid', pointInPixel)) {
                        chartRef.current!.style.cursor = 'pointer';
                    } else {
                        chartRef.current!.style.cursor = 'default';
                    }
                });
                
                chartInstance.current.getZr().on('mouseout', () => {
                    chartRef.current!.style.cursor = 'default';
                });
            }
            
            // Ajouter l'événement de clic sur les colonnes avec loader
            if (onClickSecteur) {
                chartInstance.current.on('click', (params) => {
                    if (params.componentType === 'series') {
                        const secteurName = params.name;
                        
                        // Activer le loader avant la navigation
                        const energyType = TYPE_TO_ENERGY_MAP[type];
                        const loadingMessage = `Chargement des détails pour ${secteurName}...`;
                        
                        // Démarrer le loader avec le type d'énergie approprié
                        startLoading(loadingMessage, false, energyType);
                        
                        // Appeler le callback
                        onClickSecteur(secteurName);
                    }
                });
            }
        };

        // Initialisation différée
        const timer = setTimeout(initChart, 100);

        const handleResize = () => {
            if (chartInstance.current) {
                const isMobile = window.innerWidth < 640;
                chartInstance.current.resize();
                chartInstance.current.setOption({
                    grid: {
                        left: isMobile ? '15%' : '5%',
                        bottom: isMobile ? '20%' : '15%'
                    },
                    xAxis: {
                        axisLabel: {
                            rotate: isMobile ? 45 : 0,
                            width: isMobile ? 60 : 100,
                            align: isMobile ? 'right' : 'center'
                        }
                    }
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [data, title, type, onClickSecteur, startLoading]);

    return (
        <div className="card-base">
            <div 
                ref={chartRef} 
                className="w-full h-[300px] sm:h-[350px] lg:h-[400px]"
            />
            {onClickSecteur && (
                <div className="text-center text-sm text-gray-500 mt-2 italic">
                    Survolez et cliquez sur un secteur pour voir plus de détails
                </div>
            )}
        </div>
    );
}; 