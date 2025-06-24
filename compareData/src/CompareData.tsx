import { ReactElement, createElement, useEffect, useState, ReactNode } from "react";
import { Big } from "big.js";
import { CompareDataContainerProps } from "../typings/CompareDataProps";
import { MachineCard } from "./components/MachineCard";
import { LineChart, MachineData } from "./components/LineChart";
import { MachineTable } from "./components/MachineTable";
import { PieChart } from "./components/PieChart";
import { NoSelection } from "./components/NoSelection";
import { ErrorCard } from "./components/ErrorCard";
import { EnergyType, ViewMode } from "./utils/types";
import { ChartContainer } from "./components/ChartContainer";
import { ENERGY_CONFIG } from "./utils/energyConfig";
import type { Row as ExportRow } from "./components/Export";

import "./ui/CompareData.css";

// Fonction utilitaire pour normaliser les noms de machines
function normalizeMachineName(name: string | undefined): string {
    if (!name) return "";
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

interface MachineStats {
    name: string;
    currentValue: Big;
    maxValue: Big;
    minValue: Big;
    avgValue: Big;
    sumValue: Big;
    // Propriétés pour IPE
    totalConsommationIPE?: Big;
    totalProduction?: Big;
    ipeValue?: Big;
}

interface MeasuresByMachine {
    timestamps: Date[];
    values: Big[];
}

// Helper function to generate mock data for test mode
const generateMockData = (energyType: EnergyType, viewMode: ViewMode, numMachines: number, pointsPerMachine: number, startDate: Date, endDate: Date)
    : { mockStats: MachineStats[], mockTimeseries: MachineData[], mockExportData: ExportRow[] } => {
    
    const mockStats: MachineStats[] = [];
    const mockTimeseries: MachineData[] = [];
    const mockExportData: ExportRow[] = [];
    const machineBaseNames = ["Ligne Alpha", "Secteur Prod Gamma", "Compresseur Central", "Four Traitement #3", "Unité Refroid. B", "Pompe Primaire", "Extrudeuse Delta", "Réacteur Omega", "Tour de Lavage", "Ventilateur Principal"];

    const timeDiff = endDate.getTime() - startDate.getTime();

    for (let i = 0; i < numMachines; i++) {
        const name = machineBaseNames[i % machineBaseNames.length] + (numMachines > machineBaseNames.length ? ` (${Math.floor(i / machineBaseNames.length) + 1})` : "");
        const values: Big[] = [];
        const timestamps: Date[] = [];

        let sum = new Big(0);
        let max = new Big(0);
        let min = new Big(viewMode === "ipe" ? 1000 : 50000);
        let totalConsommationIPE = new Big(0);
        let totalProduction = new Big(0);

        for (let j = 0; j < pointsPerMachine; j++) {
            const timestamp = new Date(startDate.getTime() + (timeDiff * j) / pointsPerMachine);
            timestamps.push(timestamp);
            
            let valMultiplier = 1;
            if (energyType === "electricity") valMultiplier = viewMode === "ipe" ? 0.5 : 100;
            else if (energyType === "gas") valMultiplier = viewMode === "ipe" ? 0.1 : 10;
            else if (energyType === "water") valMultiplier = viewMode === "ipe" ? 0.05 : 5;
            else if (energyType === "air") valMultiplier = viewMode === "ipe" ? 0.2 : 20;

            let pointValue: Big;
            
            if (viewMode === "ipe") {
                // Pour le mode IPE, générer des valeurs de consommation et production
                const mockConsommationIPE = new Big(Math.abs(Math.random() * 100 + 50)).round(2);
                const mockProduction = new Big(Math.abs(Math.random() * 200 + 100)).round(2);
                totalConsommationIPE = totalConsommationIPE.plus(mockConsommationIPE);
                totalProduction = totalProduction.plus(mockProduction);
                
                // Calculer la valeur IPE instantanée
                pointValue = mockProduction.eq(0) ? new Big(0) : mockConsommationIPE.div(mockProduction);
            } else {
                pointValue = new Big(Math.abs( (Math.sin(j / (pointsPerMachine / (10 + i%5))) * 50 + Math.random() * 20 + (i * 5)) * valMultiplier )).round(2);
                sum = sum.plus(pointValue);
            }
            
            values.push(pointValue);
            
            if (pointValue.gt(max)) max = pointValue;
            if (pointValue.lt(min)) min = pointValue;

            mockExportData.push({
                timestamp: timestamp,
                value: pointValue.toNumber(),
                name: name
            });
        }

        const currentValue = values.length > 0 ? values[values.length -1] : new Big(0);
        
        let finalSumValue: Big;
        let avgValue: Big;
        let ipeValue: Big | undefined;
        
        if (viewMode === "ipe") {
            // Pour le mode IPE, la somme est l'IPE global
            ipeValue = totalProduction.eq(0) ? new Big(0) : totalConsommationIPE.div(totalProduction);
            finalSumValue = ipeValue;
            avgValue = values.length > 0 ? values.reduce((acc, val) => acc.plus(val), new Big(0)).div(values.length) : new Big(0);
        } else {
            finalSumValue = sum;
            avgValue = sum.eq(0) ? new Big(0) : sum.div(Big(values.length));
        }
        
        if (values.length === 0) min = new Big(0);

        mockStats.push({
            name,
            currentValue,
            maxValue: max,
            minValue: min,
            avgValue,
            sumValue: finalSumValue,
            totalConsommationIPE: viewMode === "ipe" ? totalConsommationIPE : undefined,
            totalProduction: viewMode === "ipe" ? totalProduction : undefined,
            ipeValue: viewMode === "ipe" ? ipeValue : undefined
        });

        mockTimeseries.push({
            name,
            timestamps,
            values
        });
    }

    return { mockStats, mockTimeseries, mockExportData };
};

export function CompareData({
    selectedMachines,
    attrMachineName,
    dsMesures,
    attrMachineMesureName,
    attrTimestamp,
    attrConsommation,
    dateDebut,
    dateFin,
    energyType,
    viewMode,
    baseUnit,
    ipeMode,
    onAddProductionClick,
    enableTestMode,
    ipe1Name,
    ipe2Name,
    selectedMachines2,
    attrMachineName2,
    dsMesures2,
    attrMachineMesureName2,
    attrTimestamp2,
    attrConsommation2,
    dateDebut2,
    dateFin2,
    dsProduction_Consommation,
    attrMachineProductionName,
    attrConsommationIPE,
    attrProduction,
    dsProduction_Consommation2,
    attrMachineProductionName2,
    attrConsommationIPE2,
    attrProduction2
}: CompareDataContainerProps): ReactElement {
    const [machinesStats, setMachinesStats] = useState<MachineStats[]>([]);
    const [machinesData, setMachinesData] = useState<MachineData[]>([]);
    const [chartExportData, setChartExportData] = useState<ExportRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeIPE, setActiveIPE] = useState<1 | 2>(1);
    const [machinesStats1, setMachinesStats1] = useState<MachineStats[]>([]);
    const [machinesData1, setMachinesData1] = useState<MachineData[]>([]);
    const [chartExportData1, setChartExportData1] = useState<ExportRow[]>([]);
    const [machinesStats2, setMachinesStats2] = useState<MachineStats[]>([]);
    const [machinesData2, setMachinesData2] = useState<MachineData[]>([]);
    const [chartExportData2, setChartExportData2] = useState<ExportRow[]>([]);

    const getCurrentIPEProps = () => {
        if (ipeMode === "single" || activeIPE === 1) {
            return {
                selectedMachines,
                attrMachineName,
                dsMesures,
                attrMachineMesureName,
                attrTimestamp,
                attrConsommation,
                dateDebut,
                dateFin,
                dsProduction_Consommation,
                attrMachineProductionName,
                attrConsommationIPE,
                attrProduction,
                machinesStats: ipeMode === "single" ? machinesStats : machinesStats1,
                machinesData: ipeMode === "single" ? machinesData : machinesData1,
                chartExportData: ipeMode === "single" ? chartExportData : chartExportData1
            };
        } else {
            return {
                selectedMachines: selectedMachines2,
                attrMachineName: attrMachineName2,
                dsMesures: dsMesures2,
                attrMachineMesureName: attrMachineMesureName2,
                attrTimestamp: attrTimestamp2,
                attrConsommation: attrConsommation2,
                dateDebut: dateDebut2,
                dateFin: dateFin2,
                dsProduction_Consommation: dsProduction_Consommation2,
                attrMachineProductionName: attrMachineProductionName2,
                attrConsommationIPE: attrConsommationIPE2,
                attrProduction: attrProduction2,
                machinesStats: machinesStats2,
                machinesData: machinesData2,
                chartExportData: chartExportData2
            };
        }
    };

    // useEffect pour IPE 1 (ou mode simple)
    useEffect(() => {
        let isMounted = true;
        
        // Gérer le loading global pour tous les modes
        setIsLoading(true);
        setError(null);

        if (enableTestMode && (ipeMode === "single" || activeIPE === 1)) {
            console.log("CompareData Widget: TEST MODE ENABLED - IPE 1");
            const mockStartDate = dateDebut?.value ? new Date(dateDebut.value) : new Date(new Date().setDate(new Date().getDate() - 7));
            const mockEndDate = dateFin?.value ? new Date(dateFin.value) : new Date();
            
            if (mockStartDate >= mockEndDate) {
                mockStartDate.setDate(mockEndDate.getDate() -7);
            }

            const { mockStats, mockTimeseries, mockExportData } = generateMockData(energyType as EnergyType, viewMode as ViewMode, 8, 200, mockStartDate, mockEndDate);
            
            if (isMounted) {
                if (ipeMode === "single") {
                    setMachinesStats(mockStats);
                    setMachinesData(mockTimeseries);
                    setChartExportData(mockExportData);
                } else {
                    setMachinesStats1(mockStats);
                    setMachinesData1(mockTimeseries);
                    setChartExportData1(mockExportData);
                }
                setIsLoading(false);
            }
        } else {
            try {
                // Validations spécifiques selon le mode
                if (viewMode === "ipe") {
                    // Mode IPE : vérifier la configuration
                    if (!dsProduction_Consommation || !attrMachineProductionName || !attrConsommationIPE || !attrProduction) {
                        if (isMounted) {
                            setError("CONFIG_ERROR_IPE_ATTRIBUTES");
                            setIsLoading(false);
                        }
                        return;
                    }
                }

                if (selectedMachines?.status === "available" && selectedMachines.items && 
                    dsMesures?.status === "available" && dsMesures.items &&
                    dateDebut?.value && dateFin?.value) {
                    
                    const stats: MachineStats[] = [];
                    const timeseriesData: MachineData[] = [];

                    const selectedMachineItems = selectedMachines.items;
                    const selectedMachineNames = selectedMachineItems
                        .filter(machine => machine && attrMachineName?.get(machine).value)
                        .flatMap(machine => {
                            const name = attrMachineName?.get(machine).value ?? "Machine inconnue";
                            return name.split(',')
                                .map(n => n.trim())
                                .filter(n => n.length > 0);
                        });

                    if (selectedMachineNames.length === 0) {
                        if(isMounted) {
                            setError("NO_MACHINE_SELECTED");
                            setIsLoading(false);
                            if (ipeMode === "single") {
                                setMachinesStats([]);
                                setMachinesData([]);
                                setChartExportData([]);
                            } else {
                                setMachinesStats1([]);
                                setMachinesData1([]);
                                setChartExportData1([]);
                            }
                        }
                        return;
                    }

                    const mesuresByMachine = new Map<string, MeasuresByMachine>();
                    const ipeDataByMachine = new Map<string, { totalConsommationIPE: Big; totalProduction: Big }>();

                    // Initialiser les données IPE pour chaque machine
                    selectedMachineNames.forEach(name => {
                        ipeDataByMachine.set(name, {
                            totalConsommationIPE: new Big(0),
                            totalProduction: new Big(0)
                        });
                    });

                    // Traiter les données de mesures (pour les deux modes)
                    dsMesures.items.forEach(mesure => {
                        const machineName = attrMachineMesureName?.get(mesure).value;
                        const timestamp = attrTimestamp?.get(mesure).value;
                        const value = attrConsommation?.get(mesure).value;

                        if (!machineName || !timestamp || !value) return;

                        const normalizedMeasureName = normalizeMachineName(machineName);
                        const matchingName = selectedMachineNames.find(name => 
                            normalizeMachineName(name) === normalizedMeasureName
                        );

                        if (matchingName && timestamp >= dateDebut.value! && timestamp <= dateFin.value!) {
                            if (!mesuresByMachine.has(matchingName)) {
                                mesuresByMachine.set(matchingName, {
                                    timestamps: [],
                                    values: []
                                });
                            }

                            const machineData = mesuresByMachine.get(matchingName)!;
                            
                            let insertIndex = machineData.timestamps.findIndex(t => t > timestamp);
                            if (insertIndex === -1) insertIndex = machineData.timestamps.length;
                            
                            machineData.timestamps.splice(insertIndex, 0, timestamp);
                            machineData.values.splice(insertIndex, 0, value);
                        }
                    });

                    // Traiter les données IPE (mode IPE)
                    if (viewMode === "ipe" && dsProduction_Consommation?.status === "available" && dsProduction_Consommation.items && 
                        attrMachineProductionName && attrConsommationIPE && attrProduction) {
                        
                        console.log("Using dsProduction_Consommation for global IPE calculation - IPE 1");
                        
                        // Traiter dsProduction_Consommation pour calculer l'IPE global
                        dsProduction_Consommation.items.forEach(item => {
                            const machineName = attrMachineProductionName?.get(item).value;
                            const consommationIPE = attrConsommationIPE?.get(item).value;
                            const production = attrProduction?.get(item).value;
                            
                            if (machineName && consommationIPE && production) {
                                const normalizedName = normalizeMachineName(machineName);
                                const matchingName = selectedMachineNames.find(name => 
                                    normalizeMachineName(name) === normalizedName
                                );
                                
                                if (matchingName) {
                                    const data = ipeDataByMachine.get(matchingName);
                                    if (data) {
                                        data.totalConsommationIPE = data.totalConsommationIPE.plus(consommationIPE);
                                        data.totalProduction = data.totalProduction.plus(production);
                                    }
                                }
                            }
                        });
                    }

                    const currentChartExportData: ExportRow[] = [];
                    
                    selectedMachineNames.forEach(machineName => {
                        const machineData = mesuresByMachine.get(machineName);
                        const ipeData = ipeDataByMachine.get(machineName);

                        if (!machineData || machineData.values.length === 0) {
                            // Pas de données temporelles
                            stats.push({
                                name: machineName,
                                currentValue: new Big(0),
                                maxValue: new Big(0),
                                minValue: new Big(0),
                                avgValue: new Big(0),
                                sumValue: new Big(0),
                                totalConsommationIPE: ipeData?.totalConsommationIPE,
                                totalProduction: ipeData?.totalProduction,
                                ipeValue: ipeData && !ipeData.totalProduction.eq(0) 
                                    ? ipeData.totalConsommationIPE.div(ipeData.totalProduction) 
                                    : new Big(0)
                            });
                            timeseriesData.push({
                                name: machineName,
                                timestamps: [],
                                values: []
                            });
                            return;
                        }

                        const values = machineData.values;
                        const currentValue = values[values.length - 1];
                        const maxValue = values.reduce((max, val) => val.gt(max) ? val : max, values[0]);
                        const minValue = values.reduce((min, val) => val.lt(min) ? val : min, values[0]);
                        const sum = values.reduce((acc, val) => acc.plus(val), new Big(0));
                        const avgValue = sum.div(Big(values.length));

                        let finalSumValue = sum;
                        let ipeValue: Big | undefined;

                        // En mode IPE, calculer l'IPE global pour l'affichage
                        if (viewMode === "ipe" && ipeData && !ipeData.totalProduction.eq(0)) {
                            ipeValue = ipeData.totalConsommationIPE.div(ipeData.totalProduction);
                            finalSumValue = ipeValue; // En mode IPE, la somme affichée est l'IPE global
                        }

                        stats.push({
                            name: machineName,
                            currentValue,
                            maxValue,
                            minValue,
                            avgValue,
                            sumValue: finalSumValue,
                            totalConsommationIPE: ipeData?.totalConsommationIPE,
                            totalProduction: ipeData?.totalProduction,
                            ipeValue
                        });

                        const machineTimeSeries = {
                            name: machineName,
                            timestamps: machineData.timestamps,
                            values: machineData.values
                        };
                        timeseriesData.push(machineTimeSeries);

                        machineTimeSeries.timestamps.forEach((ts, idx) => {
                            const exportRow: ExportRow = {
                                timestamp: ts,
                                value: machineTimeSeries.values[idx].toNumber(),
                                name: machineName
                            };
                            
                            // Ajouter les informations IPE si disponibles
                            if (viewMode === "ipe" && ipeData && ipeValue) {
                                exportRow.ipeValue = ipeValue.toNumber();
                                exportRow.consommationIPE = ipeData.totalConsommationIPE.toNumber();
                                exportRow.production = ipeData.totalProduction.toNumber();
                            }
                            
                            currentChartExportData.push(exportRow);
                        });
                    });

                    if (isMounted) {
                        if (ipeMode === "single") {
                            setMachinesStats(stats);
                            setMachinesData(timeseriesData);
                            setChartExportData(currentChartExportData);
                        } else {
                            setMachinesStats1(stats);
                            setMachinesData1(timeseriesData);
                            setChartExportData1(currentChartExportData);
                        }
                    }
                } else {
                    if (isMounted) {
                        if (selectedMachines?.status === "loading" || dsMesures?.status === "loading" || 
                            dateDebut?.status === "loading" || dateFin?.status === "loading") {
                            // Keep loading
                        } else if (selectedMachines?.status === "available" && (!selectedMachines?.items || selectedMachines.items.length === 0 )) {
                            setError("NO_MACHINE_SELECTED");
                            setIsLoading(false);
                        } else if (!dateDebut?.value || !dateFin?.value) {
                            setError("DATE_NOT_SELECTED");
                            setIsLoading(false);
                        } else {
                            setError("DATA_SOURCE_NOT_READY"); 
                            setIsLoading(false);
                        }
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error processing data IPE 1:", err);
                    setError(err instanceof Error ? err.message : "Une erreur est survenue lors du traitement des données");
                    if (ipeMode === "single") {
                        setMachinesStats([]);
                        setMachinesData([]);
                        setChartExportData([]);
                    } else {
                        setMachinesStats1([]);
                        setMachinesData1([]);
                        setChartExportData1([]);
                    }
                    setIsLoading(false);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        return () => {
            isMounted = false;
        };
    }, [selectedMachines, dsMesures, dsProduction_Consommation, attrMachineName, attrMachineMesureName, 
        attrMachineProductionName, attrTimestamp, attrConsommation, 
        attrConsommationIPE, attrProduction, dateDebut, dateFin, energyType, viewMode, enableTestMode, ipeMode, activeIPE]);

    // useEffect pour IPE 2 (mode double uniquement)
    useEffect(() => {
        if (ipeMode !== "double") return;

        let isMounted = true;

        if (enableTestMode) {
            console.log("CompareData Widget: TEST MODE ENABLED - IPE 2");
            const mockStartDate = dateDebut2?.value ? new Date(dateDebut2.value) : new Date(new Date().setDate(new Date().getDate() - 7));
            const mockEndDate = dateFin2?.value ? new Date(dateFin2.value) : new Date();
            
            if (mockStartDate >= mockEndDate) {
                mockStartDate.setDate(mockEndDate.getDate() -7);
            }

            const { mockStats, mockTimeseries, mockExportData } = generateMockData(energyType as EnergyType, viewMode as ViewMode, 6, 150, mockStartDate, mockEndDate);
            
            if (isMounted) {
                setMachinesStats2(mockStats);
                setMachinesData2(mockTimeseries);
                setChartExportData2(mockExportData);
            }
        } else {
            try {
                // Validations spécifiques pour IPE 2
                if (viewMode === "ipe") {
                    if (!dsProduction_Consommation2 || !attrMachineProductionName2 || !attrConsommationIPE2 || !attrProduction2) {
                        return; // Pas d'erreur, juste pas de données pour IPE 2
                    }
                }

                if (selectedMachines2?.status === "available" && selectedMachines2.items && 
                    dsMesures2?.status === "available" && dsMesures2.items &&
                    dateDebut2?.value && dateFin2?.value) {
                    
                    const stats: MachineStats[] = [];
                    const timeseriesData: MachineData[] = [];

                    const selectedMachineItems = selectedMachines2.items;
                    const selectedMachineNames = selectedMachineItems
                        .filter(machine => machine && attrMachineName2?.get(machine).value)
                        .flatMap(machine => {
                            const name = attrMachineName2?.get(machine).value ?? "Machine inconnue";
                            return name.split(',')
                                .map(n => n.trim())
                                .filter(n => n.length > 0);
                        });

                    if (selectedMachineNames.length === 0) {
                        return; // Pas d'erreur, juste pas de données pour IPE 2
                    }

                    const mesuresByMachine = new Map<string, MeasuresByMachine>();
                    const ipeDataByMachine = new Map<string, { totalConsommationIPE: Big; totalProduction: Big }>();

                    // Initialiser les données IPE pour chaque machine
                    selectedMachineNames.forEach(name => {
                        ipeDataByMachine.set(name, {
                            totalConsommationIPE: new Big(0),
                            totalProduction: new Big(0)
                        });
                    });

                    // Traiter les données de mesures IPE 2
                    dsMesures2.items.forEach(mesure => {
                        const machineName = attrMachineMesureName2?.get(mesure).value;
                        const timestamp = attrTimestamp2?.get(mesure).value;
                        const value = attrConsommation2?.get(mesure).value;

                        if (!machineName || !timestamp || !value) return;

                        const normalizedMeasureName = normalizeMachineName(machineName);
                        const matchingName = selectedMachineNames.find(name => 
                            normalizeMachineName(name) === normalizedMeasureName
                        );

                        if (matchingName && timestamp >= dateDebut2.value! && timestamp <= dateFin2.value!) {
                            if (!mesuresByMachine.has(matchingName)) {
                                mesuresByMachine.set(matchingName, {
                                    timestamps: [],
                                    values: []
                                });
                            }

                            const machineData = mesuresByMachine.get(matchingName)!;
                            
                            let insertIndex = machineData.timestamps.findIndex(t => t > timestamp);
                            if (insertIndex === -1) insertIndex = machineData.timestamps.length;
                            
                            machineData.timestamps.splice(insertIndex, 0, timestamp);
                            machineData.values.splice(insertIndex, 0, value);
                        }
                    });

                    // Traiter les données IPE 2 (mode IPE)
                    if (viewMode === "ipe" && dsProduction_Consommation2?.status === "available" && dsProduction_Consommation2.items && 
                        attrMachineProductionName2 && attrConsommationIPE2 && attrProduction2) {
                        
                        console.log("Using dsProduction_Consommation2 for global IPE calculation - IPE 2");
                        
                        dsProduction_Consommation2.items.forEach(item => {
                            const machineName = attrMachineProductionName2?.get(item).value;
                            const consommationIPE = attrConsommationIPE2?.get(item).value;
                            const production = attrProduction2?.get(item).value;
                            
                            if (machineName && consommationIPE && production) {
                                const normalizedName = normalizeMachineName(machineName);
                                const matchingName = selectedMachineNames.find(name => 
                                    normalizeMachineName(name) === normalizedName
                                );
                                
                                if (matchingName) {
                                    const data = ipeDataByMachine.get(matchingName);
                                    if (data) {
                                        data.totalConsommationIPE = data.totalConsommationIPE.plus(consommationIPE);
                                        data.totalProduction = data.totalProduction.plus(production);
                                    }
                                }
                            }
                        });
                    }

                    const currentChartExportData: ExportRow[] = [];
                    
                    selectedMachineNames.forEach(machineName => {
                        const machineData = mesuresByMachine.get(machineName);
                        const ipeData = ipeDataByMachine.get(machineName);

                        if (!machineData || machineData.values.length === 0) {
                            stats.push({
                                name: machineName,
                                currentValue: new Big(0),
                                maxValue: new Big(0),
                                minValue: new Big(0),
                                avgValue: new Big(0),
                                sumValue: new Big(0),
                                totalConsommationIPE: ipeData?.totalConsommationIPE,
                                totalProduction: ipeData?.totalProduction,
                                ipeValue: ipeData && !ipeData.totalProduction.eq(0) 
                                    ? ipeData.totalConsommationIPE.div(ipeData.totalProduction) 
                                    : new Big(0)
                            });
                            timeseriesData.push({
                                name: machineName,
                                timestamps: [],
                                values: []
                            });
                            return;
                        }

                        const values = machineData.values;
                        const currentValue = values[values.length - 1];
                        const maxValue = values.reduce((max, val) => val.gt(max) ? val : max, values[0]);
                        const minValue = values.reduce((min, val) => val.lt(min) ? val : min, values[0]);
                        const sum = values.reduce((acc, val) => acc.plus(val), new Big(0));
                        const avgValue = sum.div(Big(values.length));

                        let finalSumValue = sum;
                        let ipeValue: Big | undefined;

                        if (viewMode === "ipe" && ipeData && !ipeData.totalProduction.eq(0)) {
                            ipeValue = ipeData.totalConsommationIPE.div(ipeData.totalProduction);
                            finalSumValue = ipeValue;
                        }

                        stats.push({
                            name: machineName,
                            currentValue,
                            maxValue,
                            minValue,
                            avgValue,
                            sumValue: finalSumValue,
                            totalConsommationIPE: ipeData?.totalConsommationIPE,
                            totalProduction: ipeData?.totalProduction,
                            ipeValue
                        });

                        const machineTimeSeries = {
                            name: machineName,
                            timestamps: machineData.timestamps,
                            values: machineData.values
                        };
                        timeseriesData.push(machineTimeSeries);

                        machineTimeSeries.timestamps.forEach((ts, idx) => {
                            const exportRow: ExportRow = {
                                timestamp: ts,
                                value: machineTimeSeries.values[idx].toNumber(),
                                name: machineName
                            };
                            
                            if (viewMode === "ipe" && ipeData && ipeValue) {
                                exportRow.ipeValue = ipeValue.toNumber();
                                exportRow.consommationIPE = ipeData.totalConsommationIPE.toNumber();
                                exportRow.production = ipeData.totalProduction.toNumber();
                            }
                            
                            currentChartExportData.push(exportRow);
                        });
                    });

                    if (isMounted) {
                        setMachinesStats2(stats);
                        setMachinesData2(timeseriesData);
                        setChartExportData2(currentChartExportData);
                    }
                }
            } catch (err) {
                console.error("Error processing data IPE 2:", err);
                // En mode double, on ne fait pas planter l'interface si IPE 2 échoue
            }
        }

        return () => {
            isMounted = false;
        };
    }, [selectedMachines2, dsMesures2, dsProduction_Consommation2, attrMachineName2, attrMachineMesureName2, 
        attrMachineProductionName2, attrTimestamp2, attrConsommation2, 
        attrConsommationIPE2, attrProduction2, dateDebut2, dateFin2, energyType, viewMode, enableTestMode, ipeMode]);

    const handleAddProductionClick = () => {
        if (onAddProductionClick && onAddProductionClick.canExecute) {
            onAddProductionClick.execute();
        }
    };

    if (isLoading && !enableTestMode) { 
        return createElement("div", { className: "widget-loading" }, "Chargement des données Mendix...");
    }
    
    if (error && !enableTestMode) { 
        if (error === "NO_MACHINE_SELECTED") {
            return createElement(NoSelection);
        }
        if (error === "DATE_NOT_SELECTED"){
            return createElement(ErrorCard, { title: "Dates non sélectionnées", message: "Veuillez sélectionner une date de début et de fin pour afficher les données." });
        }
        if (error === "CONFIG_ERROR_IPE_ATTRIBUTES") {
            return createElement(ErrorCard, { 
                title: "Configuration IPE manquante", 
                message: "Pour utiliser le mode IPE, veuillez configurer dsProduction_Consommation avec tous les attributs requis." 
            });
        }
        if (error === "DATA_SOURCE_NOT_READY") {
            return createElement(ErrorCard, { title: "Données non disponibles", message: "Les sources de données ne sont pas prêtes. Veuillez vérifier la configuration des attributs et des dates."});
        }
        return createElement(ErrorCard, { message: error });
    }

    const currentEnergyConfig = ENERGY_CONFIG[energyType as EnergyType];
    if (!currentEnergyConfig) {
        return createElement(ErrorCard, { message: `Configuration d'énergie non valide pour le type : ${energyType}` });
    }

    // Obtenir les données de l'IPE actuel
    const currentProps = getCurrentIPEProps();
    const currentMachinesStats = currentProps.machinesStats;
    const currentMachinesData = currentProps.machinesData;
    const currentChartExportData = currentProps.chartExportData;

    // Déterminer le suffixe du titre selon le mode
    let titleSuffix = "";
    if (ipeMode === "double") {
        const ipeName = activeIPE === 1 ? (ipe1Name || "IPE 1") : (ipe2Name || "IPE 2");
        titleSuffix = ` - ${ipeName}`;
    }

    const chartTitle = `${enableTestMode ? "[MODE TEST] " : ""}Analyse Comparative: ${currentEnergyConfig.label} (${viewMode === "ipe" ? "IPE" : "Consommation"})${titleSuffix}`;
    const exportFilename = `export_${enableTestMode ? "test_mode_" : ""}comparaison_${(energyType as EnergyType).toLowerCase()}_${viewMode}${ipeMode === "double" ? `_ipe${activeIPE}` : ""}`;
    
    // Vérifier si nous avons des données à afficher
    const hasData = currentMachinesStats.length > 0 && currentMachinesData.length > 0;
    
    if (!isLoading && !hasData) {
        if (enableTestMode) {
            return createElement(ErrorCard, { title: "Erreur Mode Test", message: "La génération des données de test a échoué ou n'a produit aucune donnée." })
        } else if (error && error !== "NO_MACHINE_SELECTED" && error !== "DATE_NOT_SELECTED") {
            return createElement(ErrorCard, { message: "Aucune donnée à afficher pour la sélection actuelle après traitement."});
        } 
    }

    // Déterminer les dates à afficher selon l'IPE actif
    let effectiveDateDebut = dateDebut;
    let effectiveDateFin = dateFin;
    if (ipeMode === "double" && activeIPE === 2) {
        effectiveDateDebut = dateDebut2 || dateDebut;
        effectiveDateFin = dateFin2 || dateFin;
    }

    let headerInfo: ReactNode = null;

    // Suppression de l'affichage de la période selon la demande utilisateur
    /*
    if (effectiveDateDebut?.value && effectiveDateFin?.value) {
        headerInfo = createElement("div", {
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
                fontSize: '0.875rem', 
                color: '#4B5563' 
            }
        }, createElement("span", null, `Période: ${formatDateForHeader(effectiveDateDebut && effectiveDateDebut.value)} - ${formatDateForHeader(effectiveDateFin && effectiveDateFin.value)}`));
    }
    */

    // Déterminer si le toggle doit être affiché
    const shouldShowToggle: boolean = ipeMode === "double" && viewMode === "ipe" && 
                            !!(ipe1Name && ipe1Name.trim() !== "") && 
                            !!(ipe2Name && ipe2Name.trim() !== "") && 
                            machinesStats1.length > 0 && machinesStats2.length > 0;

    return createElement(ChartContainer, {
        title: chartTitle,
        energyConfig: currentEnergyConfig,
        data: currentChartExportData,
        filename: exportFilename,
        showLineChart: false,
        showHeatMap: false,
        extraHeaderContent: headerInfo,
        showIPEToggle: shouldShowToggle,
        ipe1Name: ipe1Name || undefined,
        ipe2Name: ipe2Name || undefined,
        activeIPE: activeIPE,
        onIPEToggle: setActiveIPE
    }, 
        createElement("div", { className: "widget-layout-container" },
            createElement("div", { className: "widget-cards-grid" },
                currentMachinesStats.map((machine) => 
                    createElement(MachineCard, {
                        key: `${machine.name}-${ipeMode}-${activeIPE}-${enableTestMode ? "test" : (effectiveDateDebut?.value?.getTime() ?? 'no-start')}-${enableTestMode ? "test" : (effectiveDateFin?.value?.getTime() ?? 'no-end')}`,
                        name: machine.name,
                        currentValue: machine.currentValue,
                        maxValue: machine.maxValue,
                        minValue: machine.minValue,
                        sumValue: machine.sumValue,
                        type: energyType as EnergyType,
                        viewMode: viewMode as ViewMode,
                        baseUnit: baseUnit,
                        totalConsommationIPE: machine.totalConsommationIPE,
                        totalProduction: machine.totalProduction,
                        ipeValue: machine.ipeValue
                    })
                )
            ),
            createElement("div", { className: "widget-charts-container" },
                createElement("div", { className: "widget-chart-left" },
                    createElement(LineChart, {
                        data: currentMachinesData,
                        type: energyType as EnergyType,
                        viewMode: viewMode as ViewMode,
                        onAddProductionClick: viewMode === "ipe" ? handleAddProductionClick : undefined
                    })
                ),
                createElement("div", { className: "widget-chart-right" },
                    createElement(PieChart, {
                        machines: currentMachinesStats,
                        type: energyType as EnergyType,
                        viewMode: viewMode as ViewMode
                    })
                )
            ),
            createElement("div", { className: "widget-table-container" },
                createElement(MachineTable, {
                    machines: currentMachinesStats,
                    type: energyType as EnergyType,
                    viewMode: viewMode as ViewMode,
                    baseUnit: baseUnit
                })
            )
        )
    );
}