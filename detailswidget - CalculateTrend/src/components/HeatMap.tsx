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
    granularityMode?: "auto" | "strict";
    granularityValue?: number;
    granularityUnit?: string;
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

export const HeatMap = ({ data, energyConfig, height = "400px", startDate, endDate, granularityMode, granularityValue, granularityUnit }: HeatMapProps): React.ReactElement => {
    const hasData = data && data.length > 0;

    const options: EChartsOption = useMemo(() => {
        if (!startDate || !endDate || !hasData) {
            return {};
        }

        // Détecter l'intervalle de temps entre les données
        const detectTimeInterval = (): TimeInterval => {
            // Si la granularité est définie par l'utilisateur, l'utiliser en priorité
            if (granularityMode === "strict" && granularityValue && granularityUnit) {
                return convertGranularityToTimeInterval(granularityValue, granularityUnit);
            }
            
            // Sinon, utiliser la détection automatique existante
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

        // Fonction pour convertir la granularité utilisateur en TimeInterval
        const convertGranularityToTimeInterval = (value: number, unit: string): TimeInterval => {
            switch (unit) {
                case "minute":
                    return { type: "minute", value };
                case "hour":
                    return { type: "hour", value };
                case "day":
                    return { type: "day", value };
                case "week":
                    return { type: "day", value: value * 7 }; // Convertir semaines en jours
                case "month":
                    return { type: "day", value: value * 30 }; // Approximation : 1 mois = 30 jours
                case "quarter":
                    return { type: "day", value: value * 90 }; // Approximation : 1 trimestre = 90 jours
                case "year":
                    return { type: "day", value: value * 365 }; // 1 année = 365 jours
                default:
                    return { type: "minute", value: 5 }; // Fallback par défaut
            }
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

        // Fonction d'agrégation des données par bucket temporel
        const aggregateDataByBuckets = (timeInterval: TimeInterval) => {
            const bucketMap = new Map<string, number[]>();
            
            // Filtrer et grouper les données par buckets
            data.filter(item => 
                item.timestamp >= startDate && 
                item.timestamp <= endDate
            ).forEach(item => {
                const bucketKey = getBucketKey(item.timestamp, timeInterval, displayMode);
                if (!bucketMap.has(bucketKey)) {
                    bucketMap.set(bucketKey, []);
                }
                bucketMap.get(bucketKey)!.push(item.value.toNumber());
            });

            // Calculer la somme pour chaque bucket
            const aggregatedData = new Map<string, number>();
            bucketMap.forEach((values, key) => {
                const sum = values.reduce((acc, val) => acc + val, 0);
                aggregatedData.set(key, sum);
            });

            return aggregatedData;
        };

        // Fonction pour générer la clé de bucket temporel
        const getBucketKey = (timestamp: Date, interval: TimeInterval, mode: DisplayMode): string => {
            const date = new Date(timestamp);
            let x: number;
            let y: string;

            switch (mode) {
                case "day":
                    if (interval.type === "minute" && interval.value === 5) {
                        x = Math.floor(date.getMinutes() / 5);
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}-${date.getHours().toString().padStart(2, "0")}`;
                    } else if (interval.type === "minute") {
                        // Aggreger selon la granularité utilisateur
                        const bucketMinutes = Math.floor(date.getMinutes() / interval.value) * interval.value;
                        const bucketHour = date.getHours();
                        const totalBucketMinutes = bucketHour * 60 + bucketMinutes;
                        x = Math.floor(totalBucketMinutes / interval.value);
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                    } else if (interval.type === "hour") {
                        const bucketHour = Math.floor(date.getHours() / interval.value) * interval.value;
                        x = Math.floor(bucketHour / interval.value);
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                    } else {
                        x = date.getHours();
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                    }
                    break;
                case "week":
                    x = date.getDay() === 0 ? 6 : date.getDay() - 1;
                    y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
                    break;
                case "month":
                    if (interval.type === "day" && interval.value > 1) {
                        // Aggreger par plusieurs jours
                        const bucketDay = Math.floor((date.getDate() - 1) / interval.value) * interval.value + 1;
                        x = Math.floor((bucketDay - 1) / interval.value);
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
                    } else {
                        x = date.getDate();
                        y = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
                    }
                    break;
            }

            return `${x}-${y}`;
        };

        // Générer les points pour la heatmap
        const generateHeatmapPoints = () => {
            const points: Array<HeatMapPoint> = [];
            const xSet = new Set<number>();
            const ySet = new Set<string>();

            // Obtenir les données agrégées par buckets
            const aggregatedData = aggregateDataByBuckets(timeInterval);
            
            // Créer un Map pour stocker les données agrégées
            const dataMap = new Map<string, number>();
            aggregatedData.forEach((value, key) => {
                dataMap.set(key, value);
            });
            
            // Les données sont déjà agrégées dans dataMap, plus besoin de traitement individuel

            // Générer tous les buckets temporels possibles selon la granularité
            const generateTimeBuckets = () => {
                const buckets: Array<{x: number, y: string, key: string}> = [];
                const currentDate = new Date(startDate);

                // Selon le type de granularité, nous devons adapter la génération des buckets
                switch (displayMode) {
                    case "day":
                        // Générer les buckets pour chaque jour
                        while (currentDate <= endDate) {
                            const year = currentDate.getFullYear();
                            const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
                            const day = currentDate.getDate().toString().padStart(2, "0");

                            if (timeInterval.type === "minute" && timeInterval.value === 5) {
                                // Cas spécial 5 minutes : par heure
                                for (let hour = 0; hour < 24; hour++) {
                                    const hours = hour.toString().padStart(2, "0");
                                    const y = `${year}-${month}-${day}-${hours}`;
                                    for (let min = 0; min < 60; min += 5) {
                                        const x = min / 5;
                                        const key = `${x}-${y}`;
                                        buckets.push({ x, y, key });
                                    }
                                }
                            } else if (timeInterval.type === "minute") {
                                // Buckets par intervalle de minutes personnalisé
                                const y = `${year}-${month}-${day}`;
                                for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += timeInterval.value) {
                                    const x = Math.floor(totalMinutes / timeInterval.value);
                                    const key = `${x}-${y}`;
                                    buckets.push({ x, y, key });
                                }
                            } else if (timeInterval.type === "hour") {
                                // Buckets par intervalle d'heures personnalisé
                                const y = `${year}-${month}-${day}`;
                                for (let hour = 0; hour < 24; hour += timeInterval.value) {
                                    const x = Math.floor(hour / timeInterval.value);
                                    const key = `${x}-${y}`;
                                    buckets.push({ x, y, key });
                                }
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        break;

                    case "week":
                        // Générer les buckets par semaine
                        while (currentDate <= endDate) {
                            const year = currentDate.getFullYear();
                            const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
                            const weekNum = Math.ceil((currentDate.getDate() + new Date(year, currentDate.getMonth(), 1).getDay()) / 7);
                            const x = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
                            const y = `${year}-${month}-W${weekNum}`;
                            const key = `${x}-${y}`;
                            buckets.push({ x, y, key });
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                        break;

                    case "month":
                        // Générer les buckets par mois
                        while (currentDate <= endDate) {
                            const year = currentDate.getFullYear();
                            const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
                            
                            if (timeInterval.type === "day" && timeInterval.value > 1) {
                                // Buckets par groupe de jours
                                const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
                                for (let day = 1; day <= daysInMonth; day += timeInterval.value) {
                                    const x = Math.floor((day - 1) / timeInterval.value);
                                    const y = `${year}-${month}`;
                                    const key = `${x}-${y}`;
                                    buckets.push({ x, y, key });
                                }
                                // Passer au mois suivant
                                currentDate.setMonth(currentDate.getMonth() + 1, 1);
                            } else {
                                // Un bucket par jour du mois
                                const x = currentDate.getDate();
                                const y = `${year}-${month}`;
                                const key = `${x}-${y}`;
                                buckets.push({ x, y, key });
                                currentDate.setDate(currentDate.getDate() + 1);
                            }
                        }
                        break;
                }

                return buckets;
            };

            // Générer tous les buckets possibles et créer les points
            const timeBuckets = generateTimeBuckets();
            timeBuckets.forEach(bucket => {
                xSet.add(bucket.x);
                ySet.add(bucket.y);
                points.push({
                    x: bucket.x,
                    y: bucket.y,
                    value: dataMap.get(bucket.key) ?? null
                });
            });

            return {
                points,
                xValues: Array.from(xSet).sort((a, b) => a - b),
                yValues: Array.from(ySet).sort((a, b) => a.localeCompare(b))
            };
        };

        const { points, xValues, yValues } = generateHeatmapPoints();

        // Générer les labels pour l'axe X adaptés à la granularité
        const getXLabel = (value: number): string => {
            switch (displayMode) {
                case "day":
                    if (timeInterval.type === "minute" && timeInterval.value === 5) {
                        // Pour l'intervalle 5min, afficher uniquement les minutes
                        const minutes = value * timeInterval.value;
                        return `${minutes.toString().padStart(2, "0")}`;
                    } else if (timeInterval.type === "minute") {
                        // Pour les intervalles personnalisés de minutes
                        const totalMinutes = value * timeInterval.value;
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        if (timeInterval.value >= 60) {
                            // Si >= 1h, afficher seulement l'heure
                            return `${hours.toString().padStart(2, "0")}h`;
                        } else {
                            // Sinon afficher heure:minute
                            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                        }
                    } else if (timeInterval.type === "hour") {
                        // Pour les intervalles d'heures personnalisés
                        const startHour = value * timeInterval.value;
                        if (timeInterval.value === 1) {
                            return `${startHour.toString().padStart(2, "0")}h`;
                        } else {
                            const endHour = startHour + timeInterval.value;
                            return `${startHour.toString().padStart(2, "0")}h-${endHour.toString().padStart(2, "0")}h`;
                        }
                    }
                    return `${value.toString().padStart(2, "0")}:00`;
                case "week":
                    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                    return days[value];
                case "month":
                    if (timeInterval.type === "day" && timeInterval.value > 1) {
                        // Pour les groupes de jours
                        const startDay = value * timeInterval.value + 1;
                        const endDay = Math.min(startDay + timeInterval.value - 1, 31);
                        return `${startDay}-${endDay}`;
                    }
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
    }, [data, energyConfig, hasData, startDate, endDate, granularityMode, granularityValue, granularityUnit]);

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