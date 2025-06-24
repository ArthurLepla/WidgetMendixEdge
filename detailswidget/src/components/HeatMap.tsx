import { createElement, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts";
import { Big } from "big.js";
import { EnergyConfig } from "../utils/energy";
import { NoDataMessage } from "./NoDataMessage";

interface HeatMapProps {
    data: Array<{
        timestamp: Date;
        value: Big;
    }>;
    energyConfig: EnergyConfig;
    height?: string;
    startDate?: Date;
    endDate?: Date;
}

type DisplayMode = "day" | "week" | "month";

interface HeatMapPoint {
    x: number;
    y: string;
    value: number | null;
}

type TimeInterval = {
    type: "minute" | "hour" | "day";
    value: number;  // 5 pour 5 minutes, 1 pour 1 heure, etc.
};

export const HeatMap = ({ data, energyConfig, height = "400px", startDate, endDate }: HeatMapProps): React.ReactElement => {
    const hasData = data && data.length > 0;

    const options: EChartsOption = useMemo(() => {
        if (!startDate || !endDate || !hasData) {
            return {};
        }

        // Détecter l'intervalle de temps entre les données
        const detectTimeInterval = (): TimeInterval => {
            const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            const intervals: number[] = [];
            
            for (let i = 1; i < sortedData.length; i++) {
                const diff = sortedData[i].timestamp.getTime() - sortedData[i-1].timestamp.getTime();
                intervals.push(diff);
            }

            // Calculer l'intervalle le plus fréquent
            const intervalCounts = new Map<number, number>();
            intervals.forEach(interval => {
                intervalCounts.set(interval, (intervalCounts.get(interval) || 0) + 1);
            });

            let mostCommonInterval = 0;
            let maxCount = 0;
            intervalCounts.forEach((count, interval) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonInterval = interval;
                }
            });

            // Convertir en minutes/heures/jours
            const minutes = mostCommonInterval / (1000 * 60);
            if (minutes <= 60) {
                return { type: "minute", value: Math.round(minutes) };
            }
            
            const hours = minutes / 60;
            if (hours <= 24) {
                return { type: "hour", value: Math.round(hours) };
            }

            return { type: "day", value: Math.round(hours / 24) };
        };

        const getDurationInDays = (start: Date, end: Date): number => {
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        };

        const getDisplayMode = (durationInDays: number, interval: TimeInterval): DisplayMode => {
            // Si l'intervalle est en heures (4h ou 8h), on force le mode "day"
            if (interval.type === "hour" && (interval.value === 4 || interval.value === 8)) {
                return "day";
            }
            
            // Sinon, on applique la logique standard
            if (durationInDays <= 7) return "day";
            if (durationInDays <= 31) return "week";
            return "month";
        };

        const timeInterval = detectTimeInterval();
        const durationInDays = getDurationInDays(startDate, endDate);
        const displayMode = getDisplayMode(durationInDays, timeInterval);

        // Générer les points pour la heatmap
        const generateHeatmapPoints = () => {
            const points: Array<HeatMapPoint> = [];
            const xSet = new Set<number>();
            const ySet = new Set<string>();

            // Créer un Map pour stocker les données existantes
            const dataMap = new Map<string, number>();
            
            // Filtrer et stocker les données existantes
            data.filter(item => 
                item.timestamp >= startDate && 
                item.timestamp <= endDate
            ).forEach(item => {
                const date = new Date(item.timestamp);
                let key: string;
                let x: number;
                let y: string;

                switch (displayMode) {
                    case "day":
                        if (timeInterval.type === "minute" && timeInterval.value === 5) {
                            x = Math.floor(date.getMinutes() / 5);
                            y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}-${date.getHours().toString().padStart(2, "0")}`;
                        } else if (timeInterval.type === "minute") {
                            const totalMinutes = date.getHours() * 60 + date.getMinutes();
                            x = Math.floor(totalMinutes / timeInterval.value);
                            y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                        } else if (timeInterval.type === "hour") {
                            x = Math.floor(date.getHours() / timeInterval.value);
                            y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                        } else {
                            x = date.getHours();
                            y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                        }
                        key = `${x}-${y}`;
                        break;
                    case "week":
                        x = date.getDay() === 0 ? 6 : date.getDay() - 1;
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
                        key = `${x}-${y}`;
                        break;
                    case "month":
                        x = date.getDate();
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
                        key = `${x}-${y}`;
                        break;
                }

                dataMap.set(key, item.value.toNumber());
            });

            // Générer tous les points possibles pour la période
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
                const day = currentDate.getDate().toString().padStart(2, "0");

                switch (displayMode) {
                    case "day":
                        if (timeInterval.type === "minute" && timeInterval.value === 5) {
                            const hours = currentDate.getHours().toString().padStart(2, "0");
                            const y = `${year}-${month}-${day}-${hours}`;
                            for (let min = 0; min < 60; min += 5) {
                                const x = min / 5;
                                const key = `${x}-${y}`;
                                xSet.add(x);
                                ySet.add(y);
                                points.push({ 
                                    x, 
                                    y, 
                                    value: dataMap.get(key) ?? null 
                                });
                            }
                        } else if (timeInterval.type === "minute") {
                            const totalMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
                            const x = Math.floor(totalMinutes / timeInterval.value);
                            const y = `${year}-${month}-${day}`;
                            const key = `${x}-${y}`;
                            xSet.add(x);
                            ySet.add(y);
                            points.push({ 
                                x, 
                                y, 
                                value: dataMap.get(key) ?? null 
                            });
                        } else if (timeInterval.type === "hour") {
                            const x = Math.floor(currentDate.getHours() / timeInterval.value);
                            const y = `${year}-${month}-${day}`;
                            const key = `${x}-${y}`;
                            xSet.add(x);
                            ySet.add(y);
                            points.push({ 
                                x, 
                                y, 
                                value: dataMap.get(key) ?? null 
                            });
                        }
                        break;
                    case "week":
                        const x = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
                        const weekNum = Math.ceil((currentDate.getDate() + new Date(year, currentDate.getMonth(), 1).getDay()) / 7);
                        const y = `${year}-${month}-W${weekNum}`;
                        const key = `${x}-${y}`;
                        xSet.add(x);
                        ySet.add(y);
                        points.push({ 
                            x, 
                            y, 
                            value: dataMap.get(key) ?? null 
                        });
                        break;
                    case "month":
                        const xMonth = currentDate.getDate();
                        const yMonth = `${year}-${month}`;
                        const keyMonth = `${xMonth}-${yMonth}`;
                        xSet.add(xMonth);
                        ySet.add(yMonth);
                        points.push({ 
                            x: xMonth, 
                            y: yMonth, 
                            value: dataMap.get(keyMonth) ?? null 
                        });
                        break;
                }

                // Incrémenter selon l'intervalle
                switch (displayMode) {
                    case "day":
                        if (timeInterval.type === "minute") {
                            currentDate.setMinutes(currentDate.getMinutes() + timeInterval.value);
                        } else if (timeInterval.type === "hour") {
                            currentDate.setHours(currentDate.getHours() + timeInterval.value);
                        } else {
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        break;
                    case "week":
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                    case "month":
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                }
            }

            return {
                points,
                xValues: Array.from(xSet).sort((a, b) => a - b),
                yValues: Array.from(ySet).sort((a, b) => a.localeCompare(b))
            };
        };

        const { points, xValues, yValues } = generateHeatmapPoints();

        // Générer les labels
        const getXLabel = (value: number): string => {
            switch (displayMode) {
                case "day":
                    if (timeInterval.type === "minute" && timeInterval.value === 5) {
                        // Pour l'intervalle 5min, afficher uniquement les minutes
                        const minutes = value * timeInterval.value;
                        return `${minutes.toString().padStart(2, "0")}`;
                    } else if (timeInterval.type === "minute") {
                        const totalMinutes = value * timeInterval.value;
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                    } else if (timeInterval.type === "hour") {
                        const startHour = value * timeInterval.value;
                        const endHour = startHour + timeInterval.value;
                        return `${startHour.toString().padStart(2, "0")}h-${endHour.toString().padStart(2, "0")}h`;
                    }
                    return `${value.toString().padStart(2, "0")}:00`;
                case "week":
                    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                    return days[value];
                case "month":
                    return value.toString().padStart(2, "0");
            }
        };

        const getYLabel = (value: string): string => {
            const [year, month, detail, hour] = value.split("-");
            
            switch (displayMode) {
                case "day":
                    if (timeInterval.type === "minute" && timeInterval.value === 5) {
                        // Pour l'intervalle 5min, afficher l'heure
                        return `${hour}h`;
                    }
                    if (timeInterval.type === "hour" || timeInterval.type === "minute") {
                        return `${parseInt(detail).toString().padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
                    }
                    return `${parseInt(detail).toString().padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
                case "week":
                    if (detail.startsWith("W")) {
                        const weekNum = detail.substring(1);
                        return `Semaine ${weekNum} - ${month.padStart(2, "0")}/${year}`;
                    }
                    return value;
                case "month":
                    return `${month.padStart(2, "0")}/${year}`;
            }
        };

        const xLabels = xValues.map(getXLabel);
        const yLabels = yValues.map(getYLabel);

        // Réorganiser les données pour l'affichage
        const adjustedPoints = points.map(point => [
            xValues.indexOf(point.x),
            yValues.indexOf(point.y),
            point.value
        ]);

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
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif"
                }
            },
            tooltip: {
                position: "top",
                trigger: "item",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#e2e8f0",
                borderWidth: 1,
                padding: [12, 16],
                className: "heatmap-tooltip",
                formatter: (params: any) => {
                    const [x, y, value] = params.value;
                    const yLabel = yLabels[y];
                    const xLabel = xLabels[x];
                    
                    let formattedDate = "";
                    let formattedValue = "";

                    switch (displayMode) {
                        case "day":
                            if (timeInterval.type === "minute" && timeInterval.value === 5) {
                                // Format attendu: "JJ/MM/YYYY" dans yLabel et "HH" dans yLabel original
                                // Récupérer depuis l'original yValues[y]
                                const originalY = yValues[y]; // Format: "YYYY-MM-DD-HH"
                                const [year, month, day, hour] = originalY.split("-");
                                const minutes = (parseInt(xLabel) * 5).toString().padStart(2, "0");
                                formattedDate = `${day}/${month}/${year} ${hour}:${minutes}`;
                            } else if (timeInterval.type === "minute") {
                                // Format attendu dans yLabel: "JJ/MM/YYYY"
                                const dateParts = yLabel.split("/");
                                if (dateParts.length >= 3) {
                                    const [day, month, year] = dateParts;
                                    const [hours, minutes] = xLabel.split(":");
                                    formattedDate = `${day}/${month}/${year} ${hours || "00"}:${minutes || "00"}`;
                                } else {
                                    formattedDate = `${yLabel} ${xLabel}`;
                                }
                            } else if (timeInterval.type === "hour") {
                                // Format attendu dans yLabel: "JJ/MM/YYYY"
                                const dateParts = yLabel.split("/");
                                if (dateParts.length >= 3) {
                                    const [day, month, year] = dateParts;
                                    const startHour = xLabel.split("h-")[0] || xLabel;
                                    formattedDate = `${day}/${month}/${year} ${startHour}:00`;
                                } else {
                                    formattedDate = `${yLabel} ${xLabel}`;
                                }
                            } else {
                                // Format par défaut
                                const dateParts = yLabel.split("/");
                                if (dateParts.length >= 3) {
                                    const [day, month, year] = dateParts;
                                    formattedDate = `${day}/${month}/${year} ${xLabel}`;
                                } else {
                                    formattedDate = `${yLabel} ${xLabel}`;
                                }
                            }
                            break;
                        case "week":
                            // Format: "Lun/Mar/etc." pour xLabel et "Semaine X - MM/YYYY" pour yLabel
                            formattedDate = `${xLabel} ${yLabel}`;
                            break;
                        case "month":
                            // Format: "DD" pour xLabel et "MM/YYYY" pour yLabel
                            formattedDate = `${xLabel}/${yLabel}`;
                            break;
                        default:
                            formattedDate = `${yLabel} ${xLabel}`;
                    }

                    if (value === null || value === 0) {
                        formattedValue = "Aucune donnée";
                    } else {
                        formattedValue = `${value.toFixed(2)} ${energyConfig.unit}`;
                    }

                    return `
                    <div class="tw-text-base">
                        <div class="tw-font-semibold tw-mb-2 tw-text-[#18213e]">
                            ${formattedDate}
                        </div>
                        <div class="tw-text-[#18213e] tw-opacity-80">
                            ${formattedValue}
                        </div>
                    </div>`;
                },
                extraCssText: "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; min-width: 200px;"
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
                data: xLabels,
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ["rgba(250,250,250,0.3)", "rgba(245,245,245,0.3)"]
                    }
                },
                axisLabel: {
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: 12,
                    rotate: displayMode === "day" ? 0 : 45,
                    interval: 0,
                    formatter: (value: string) => {
                        if (displayMode === "month" && value.startsWith("Semaine")) {
                            return value.replace("Semaine", "S");
                        }
                        return value;
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#e2e8f0"
                    }
                }
            },
            yAxis: {
                type: "category",
                data: yLabels,
                inverse: true,
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ["rgba(250,250,250,0.3)", "rgba(245,245,245,0.3)"]
                    }
                },
                axisLabel: {
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: 12,
                    formatter: (value: string) => {
                        // Raccourcir les labels si nécessaire
                        if (value.length > 25) {
                            return value.substring(0, 22) + "...";
                        }
                        return value;
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#e2e8f0"
                    }
                }
            },
            series: [
                {
                    name: "Consommation",
                    type: "heatmap",
                    data: adjustedPoints.filter(([_, __, value]) => value !== null),
                    label: {
                        show: false
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: "#fff",
                            borderWidth: 2,
                            shadowBlur: 15,
                            shadowColor: energyConfig.color + "80"
                        }
                    },
                    itemStyle: {
                        borderRadius: 3,
                        borderColor: "#fff",
                        borderWidth: 1.5,
                        opacity: 0.9
                    }
                },
                {
                    name: "Pas de données",
                    type: "heatmap",
                    data: adjustedPoints.filter(([_, __, value]) => value === null).map(([x, y]) => [x, y, 0]),
                    label: {
                        show: false
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: "#fff",
                            borderWidth: 2,
                            shadowBlur: 15,
                            shadowColor: "#99999980"
                        }
                    },
                    itemStyle: {
                        borderRadius: 3,
                        borderColor: "#fff",
                        borderWidth: 1.5,
                        opacity: 0.3,
                        color: "#f5f5f5"
                    }
                }
            ],
            visualMap: {
                min: 0,
                max: Math.max(...data.map(item => item.value.toNumber())),
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: "8%",
                itemWidth: 20,
                itemHeight: 120,
                showLabel: true,
                precision: 1,
                textStyle: {
                    color: "#18213e",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: 12,
                    fontWeight: 500
                },
                formatter: (value: number) => {
                    if (value === 0) {
                        return "Aucune consommation";
                    }
                    return `${value.toFixed(1)} ${energyConfig.unit}`;
                },
                text: ["Consommation élevée", "Consommation faible"],
                inRange: {
                    color: [
                        energyConfig.color + "10", // Couleur très légère pour 0
                        energyConfig.color + "30",
                        energyConfig.color + "45",
                        energyConfig.color + "60",
                        energyConfig.color + "75",
                        energyConfig.color + "90",
                        energyConfig.color
                    ]
                }
            },
            animation: true,
            animationDuration: 1000,
            animationEasing: "cubicInOut"
        };
    }, [data, energyConfig, hasData, startDate, endDate]);

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