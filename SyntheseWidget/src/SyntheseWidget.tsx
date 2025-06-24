import React, { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import { Big } from "big.js";
import { ListAttributeValue} from "mendix";
import { MantineProvider } from '@mantine/core';
import { SyntheseWidgetContainerProps } from "../typings/SyntheseWidgetProps";
import { CardConsoTotal } from "./components/CardConsoTotal";
import { ColumnChart, SecteurData } from "./components/ColumnChart";
import { SecteurConsoCard } from "./components/SecteurConsoCard";
import { DPE } from "./components/DPE";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { LoadingService } from "./components/services/LoadingService";
import { BaseUnit } from "./utils/unitConverter";

import "./ui/SyntheseWidget.css";
import "./styles/loader.css";
import "./styles/dialog-animations.css";

// Define the specific type for threshold keys based on the naming pattern
type OriginalThresholdKey = Extract<keyof SyntheseWidgetContainerProps, `Threshold${string}_${'Day'|'Week'|'Month'}`>;

// Helper array defined outside the component or imported, now using the specific type
const ORIGINAL_THRESHOLD_KEYS: OriginalThresholdKey[] = [
    "ThresholdA_Day", "ThresholdB_Day", "ThresholdC_Day", "ThresholdD_Day", "ThresholdE_Day", "ThresholdF_Day",
    "ThresholdA_Week", "ThresholdB_Week", "ThresholdC_Week", "ThresholdD_Week", "ThresholdE_Week", "ThresholdF_Week",
    "ThresholdA_Month", "ThresholdB_Month", "ThresholdC_Month", "ThresholdD_Month", "ThresholdE_Month", "ThresholdF_Month"
];
// Helper constant defined outside the component or imported
const DEFAULT_THRESHOLDS: Record<string, number> = {
    ThresholdA_Day: 200, ThresholdB_Day: 400, ThresholdC_Day: 600, ThresholdD_Day: 800, ThresholdE_Day: 1000, ThresholdF_Day: 1200,
    ThresholdA_Week: 1400, ThresholdB_Week: 2800, ThresholdC_Week: 4200, ThresholdD_Week: 5600, ThresholdE_Week: 7000, ThresholdF_Week: 8400,
    ThresholdA_Month: 6000, ThresholdB_Month: 12000, ThresholdC_Month: 18000, ThresholdD_Month: 24000, ThresholdE_Month: 30000, ThresholdF_Month: 36000,
};

export function SyntheseWidget({
    dsUsine,
    attrTotalConsoElec,
    attrTotalConsoGaz,
    attrTotalConsoEau,
    attrTotalConsoAir,
    attrTotalConsoElecPeriodPrec,
    attrTotalConsoGazPeriodPrec,
    attrTotalConsoEauPeriodPrec,
    attrTotalConsoAirPeriodPrec,
    dsSecteurs,
    attrSecteurNom,
    attrSecteurConsoElec,
    attrSecteurConsoGaz,
    attrSecteurConsoEau,
    attrSecteurConsoAir,
    attrSecteurConsoElecPrec,
    attrSecteurConsoGazPrec,
    attrSecteurConsoEauPrec,
    attrSecteurConsoAirPrec,
    dateDebut,
    dateFin,
    onClickDay,
    onClickWeek,
    onClickMonth,
    onClickSecteurElec,
    onClickSecteurGaz,
    onClickSecteurEau,
    onClickSecteurAir,
    baseUnitElectricity,
    baseUnitGas,
    baseUnitWater,
    baseUnitAir,
    dsDPESettings,
    ThresholdA_Day,
    ThresholdB_Day,
    ThresholdC_Day,
    ThresholdD_Day,
    ThresholdE_Day,
    ThresholdF_Day,
    ThresholdA_Week,
    ThresholdB_Week,
    ThresholdC_Week,
    ThresholdD_Week,
    ThresholdE_Week,
    ThresholdF_Week,
    ThresholdA_Month,
    ThresholdB_Month,
    ThresholdC_Month,
    ThresholdD_Month,
    ThresholdE_Month,
    ThresholdF_Month,
    ThresholdA_Day_Form,
    ThresholdB_Day_Form,
    ThresholdC_Day_Form,
    ThresholdD_Day_Form,
    ThresholdE_Day_Form,
    ThresholdF_Day_Form,
    ThresholdA_Week_Form,
    ThresholdB_Week_Form,
    ThresholdC_Week_Form,
    ThresholdD_Week_Form,
    ThresholdE_Week_Form,
    ThresholdF_Week_Form,
    ThresholdA_Month_Form,
    ThresholdB_Month_Form,
    ThresholdC_Month_Form,
    ThresholdD_Month_Form,
    ThresholdE_Month_Form,
    ThresholdF_Month_Form,
    prepareAndSaveDPESettingsMF
}: SyntheseWidgetContainerProps): ReactElement {
    const [usineData, setUsineData] = useState<{
        consoElec: Big;
        consoGaz: Big;
        consoEau: Big;
        consoAir: Big;
        consoElecPrec: Big;
        consoGazPrec: Big;
        consoEauPrec: Big;
        consoAirPrec: Big;
    }>({
        consoElec: new Big(0),
        consoGaz: new Big(0),
        consoEau: new Big(0),
        consoAir: new Big(0),
        consoElecPrec: new Big(0),
        consoGazPrec: new Big(0),
        consoEauPrec: new Big(0),
        consoAirPrec: new Big(0)
    });

    const [secteursData, setSecteursData] = useState<SecteurData[]>([]);

    const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month'>('day');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const unsubscribe = LoadingService.subscribe((loading) => {
            setIsLoading(loading);
            if (loading) {
                setMessage(LoadingService.getMessage());
            }
        });
        
        return () => {
            unsubscribe();
        };
    }, []);

    const executeAction = (action: any, loadingMessage?: string) => {
        if (action?.canExecute) {
            LoadingService.executeAction(action, loadingMessage);
        }
    };

    useEffect(() => {
        if (dsUsine.status === "available" && dsUsine.items && dsUsine.items[0]) {
            const item = dsUsine.items[0];
            setUsineData({
                consoElec: attrTotalConsoElec.get(item).value ?? new Big(0),
                consoGaz: attrTotalConsoGaz.get(item).value ?? new Big(0),
                consoEau: attrTotalConsoEau.get(item).value ?? new Big(0),
                consoAir: attrTotalConsoAir.get(item).value ?? new Big(0),
                consoElecPrec: attrTotalConsoElecPeriodPrec.get(item).value ?? new Big(0),
                consoGazPrec: attrTotalConsoGazPeriodPrec.get(item).value ?? new Big(0),
                consoEauPrec: attrTotalConsoEauPeriodPrec.get(item).value ?? new Big(0),
                consoAirPrec: attrTotalConsoAirPeriodPrec.get(item).value ?? new Big(0)
            });
        }
    }, [dsUsine, attrTotalConsoElec, attrTotalConsoGaz, attrTotalConsoEau, attrTotalConsoAir,
        attrTotalConsoElecPeriodPrec, attrTotalConsoGazPeriodPrec, attrTotalConsoEauPeriodPrec, attrTotalConsoAirPeriodPrec]);

    useEffect(() => {
        if (dsSecteurs.status === "available" && dsSecteurs.items) {
            const secteurs = dsSecteurs.items.map(item => ({
                name: attrSecteurNom.get(item).value ?? "Secteur inconnu",
                consoElec: attrSecteurConsoElec.get(item).value ?? new Big(0),
                consoGaz: attrSecteurConsoGaz.get(item).value ?? new Big(0),
                consoEau: attrSecteurConsoEau.get(item).value ?? new Big(0),
                consoAir: attrSecteurConsoAir.get(item).value ?? new Big(0),
                consoElecPrec: attrSecteurConsoElecPrec.get(item).value ?? new Big(0),
                consoGazPrec: attrSecteurConsoGazPrec.get(item).value ?? new Big(0),
                consoEauPrec: attrSecteurConsoEauPrec.get(item).value ?? new Big(0),
                consoAirPrec: attrSecteurConsoAirPrec.get(item).value ?? new Big(0)
            }));
            setSecteursData(secteurs);
        }
    }, [dsSecteurs, attrSecteurNom, attrSecteurConsoElec, attrSecteurConsoGaz, attrSecteurConsoEau, attrSecteurConsoAir,
        attrSecteurConsoElecPrec, attrSecteurConsoGazPrec, attrSecteurConsoEauPrec, attrSecteurConsoAirPrec]);

    const handleDateRangeChange = (period: 'day' | 'week' | 'month') => {
        setActivePeriod(period);
        
        const periodsMap = {
            'day': 'Chargement des données du jour',
            'week': 'Chargement des données de la semaine',
            'month': 'Chargement des données du mois'
        };
        
        const loadingMessage = periodsMap[period];
        
        switch (period) {
            case 'day':
                if (onClickDay?.canExecute) {
                    executeAction(onClickDay, loadingMessage);
                }
                break;
            case 'week':
                if (onClickWeek?.canExecute) {
                    executeAction(onClickWeek, loadingMessage);
                }
                break;
            case 'month':
                if (onClickMonth?.canExecute) {
                    executeAction(onClickMonth, loadingMessage);
                }
                break;
        }

        const now = new Date();
        let start = new Date();

        switch (period) {
            case "day":
                start.setHours(0, 0, 0, 0);
                break;
            case "week":
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0, 0, 0, 0);
                break;
            case "month":
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                break;
        }

        if (dsUsine.status === "available" && dsUsine.items && dsUsine.items[0]) {
            dateDebut.setValue(new Date(start.toISOString()));
            dateFin.setValue(new Date());
        }
    };

    // Gestionnaires de clic pour chaque type d'énergie
    const handleSecteurElecClick = (secteurName: string) => {
        if (onClickSecteurElec?.canExecute) {
            const loadingMessage = `Navigation vers le détail électricité du secteur ${secteurName}`;
            executeAction(onClickSecteurElec, loadingMessage);
        }
    };

    const handleSecteurGazClick = (secteurName: string) => {
        if (onClickSecteurGaz?.canExecute) {
            const loadingMessage = `Navigation vers le détail gaz du secteur ${secteurName}`;
            executeAction(onClickSecteurGaz, loadingMessage);
        }
    };

    const handleSecteurEauClick = (secteurName: string) => {
        if (onClickSecteurEau?.canExecute) {
            const loadingMessage = `Navigation vers le détail eau du secteur ${secteurName}`;
            executeAction(onClickSecteurEau, loadingMessage);
        }
    };

    const handleSecteurAirClick = (secteurName: string) => {
        if (onClickSecteurAir?.canExecute) {
            const loadingMessage = `Navigation vers le détail air du secteur ${secteurName}`;
            executeAction(onClickSecteurAir, loadingMessage);
        }
    };

    // calculateDPEGrade function using useMemo
    const calculateDPEGrade = useMemo((): (value: number, period: 'day' | 'week' | 'month') => 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' => {
        const settingsObj = dsDPESettings?.status === "available" && dsDPESettings.items && dsDPESettings.items.length > 0
            ? dsDPESettings.items[0]
            : undefined;

        const currentThresholds: Record<string, number> = {};
        // Create a map of threshold props for easier access inside the loop
        // Explicitly type the map using OriginalThresholdKey and ListAttributeValue
        const thresholdProps: Record<OriginalThresholdKey, ListAttributeValue<Big>> = {
            ThresholdA_Day, ThresholdB_Day, ThresholdC_Day, ThresholdD_Day, ThresholdE_Day, ThresholdF_Day,
            ThresholdA_Week, ThresholdB_Week, ThresholdC_Week, ThresholdD_Week, ThresholdE_Week, ThresholdF_Week,
            ThresholdA_Month, ThresholdB_Month, ThresholdC_Month, ThresholdD_Month, ThresholdE_Month, ThresholdF_Month
        };

        if (settingsObj) {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                // Access the prop using the correctly typed key - no error expected here now
                const attr = thresholdProps[key];
                if (attr) {
                    const editableValue = attr.get(settingsObj);
                    const bigValue = editableValue?.value;
                    currentThresholds[key] = bigValue instanceof Big ? bigValue.toNumber() : DEFAULT_THRESHOLDS[key];
                } else {
                     // This case should theoretically not happen if keys match props
                    currentThresholds[key] = DEFAULT_THRESHOLDS[key];
                }
            });
        } else {
            ORIGINAL_THRESHOLD_KEYS.forEach(key => {
                currentThresholds[key] = DEFAULT_THRESHOLDS[key];
            });
        }

        // Return the calculation function
        return (value: number, period: 'day' | 'week' | 'month'): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' => {
            const periodSuffix = period === 'day' ? 'Day' : period === 'week' ? 'Week' : 'Month';
            const getThreshold = (grade: string): number => {
                const key = `Threshold${grade}_${periodSuffix}`;
                return currentThresholds[key] ?? DEFAULT_THRESHOLDS[key];
            };

            const thresholds = {
                A: getThreshold('A'), B: getThreshold('B'), C: getThreshold('C'),
                D: getThreshold('D'), E: getThreshold('E'), F: getThreshold('F'),
            };

            if (value <= thresholds.A) return 'A';
            if (value <= thresholds.B) return 'B';
            if (value <= thresholds.C) return 'C';
            if (value <= thresholds.D) return 'D';
            if (value <= thresholds.E) return 'E';
            if (value <= thresholds.F) return 'F';
            return 'G';
        };
    // *** Correction: Dependency array uses the destructured props directly ***
    }, [
        dsDPESettings,
        ThresholdA_Day, ThresholdB_Day, ThresholdC_Day, ThresholdD_Day, ThresholdE_Day, ThresholdF_Day,
        ThresholdA_Week, ThresholdB_Week, ThresholdC_Week, ThresholdD_Week, ThresholdE_Week, ThresholdF_Week,
        ThresholdA_Month, ThresholdB_Month, ThresholdC_Month, ThresholdD_Month, ThresholdE_Month, ThresholdF_Month
    ]);

    const currentGrade = calculateDPEGrade(usineData.consoElec.toNumber(), activePeriod);

    return (
        <MantineProvider>
            <React.Fragment>
                {/* LoadingOverlay positioned outside the main content flow */}
                <LoadingOverlay isLoading={isLoading} message={message} />
                
                {/* Main content */}
                <div className="syntheseWidget-root max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 font-sans space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* Date controls */}
                    <div>
                        <DateRangeSelector
                            onClickDay={() => handleDateRangeChange('day')}
                            onClickWeek={() => handleDateRangeChange('week')}
                            onClickMonth={() => handleDateRangeChange('month')}
                            activeButton={activePeriod}
                            dateDebut={dateDebut.value}
                            dateFin={dateFin.value}
                        />
                    </div>

                    {/* DPE */}
                    <div>
                        <DPE
                            dsDPESettings={dsDPESettings}
                            ThresholdA_Day={ThresholdA_Day}
                            ThresholdB_Day={ThresholdB_Day}
                            ThresholdC_Day={ThresholdC_Day}
                            ThresholdD_Day={ThresholdD_Day}
                            ThresholdE_Day={ThresholdE_Day}
                            ThresholdF_Day={ThresholdF_Day}
                            ThresholdA_Week={ThresholdA_Week}
                            ThresholdB_Week={ThresholdB_Week}
                            ThresholdC_Week={ThresholdC_Week}
                            ThresholdD_Week={ThresholdD_Week}
                            ThresholdE_Week={ThresholdE_Week}
                            ThresholdF_Week={ThresholdF_Week}
                            ThresholdA_Month={ThresholdA_Month}
                            ThresholdB_Month={ThresholdB_Month}
                            ThresholdC_Month={ThresholdC_Month}
                            ThresholdD_Month={ThresholdD_Month}
                            ThresholdE_Month={ThresholdE_Month}
                            ThresholdF_Month={ThresholdF_Month}
                            ThresholdA_Day_Form={ThresholdA_Day_Form}
                            ThresholdB_Day_Form={ThresholdB_Day_Form}
                            ThresholdC_Day_Form={ThresholdC_Day_Form}
                            ThresholdD_Day_Form={ThresholdD_Day_Form}
                            ThresholdE_Day_Form={ThresholdE_Day_Form}
                            ThresholdF_Day_Form={ThresholdF_Day_Form}
                            ThresholdA_Week_Form={ThresholdA_Week_Form}
                            ThresholdB_Week_Form={ThresholdB_Week_Form}
                            ThresholdC_Week_Form={ThresholdC_Week_Form}
                            ThresholdD_Week_Form={ThresholdD_Week_Form}
                            ThresholdE_Week_Form={ThresholdE_Week_Form}
                            ThresholdF_Week_Form={ThresholdF_Week_Form}
                            ThresholdA_Month_Form={ThresholdA_Month_Form}
                            ThresholdB_Month_Form={ThresholdB_Month_Form}
                            ThresholdC_Month_Form={ThresholdC_Month_Form}
                            ThresholdD_Month_Form={ThresholdD_Month_Form}
                            ThresholdE_Month_Form={ThresholdE_Month_Form}
                            ThresholdF_Month_Form={ThresholdF_Month_Form}
                            prepareAndSaveDPESettingsMF={prepareAndSaveDPESettingsMF}
                            grade={currentGrade}
                            value={usineData.consoElec.toNumber()}
                            period={activePeriod}
                        />
                    </div>

                    {/* Cartes de consommation totale */}
                    <div className="grid-responsive-4">
                        <CardConsoTotal
                            title="Électricité"
                            currentValue={usineData.consoElec}
                            previousValue={usineData.consoElecPrec}
                            type="electricity"
                            baseUnit={baseUnitElectricity as BaseUnit}
                        />
                        <CardConsoTotal
                            title="Gaz"
                            currentValue={usineData.consoGaz}
                            previousValue={usineData.consoGazPrec}
                            type="gas"
                            baseUnit={baseUnitGas as BaseUnit}
                        />
                        <CardConsoTotal
                            title="Eau"
                            currentValue={usineData.consoEau}
                            previousValue={usineData.consoEauPrec}
                            type="water"
                            baseUnit={baseUnitWater as BaseUnit}
                        />
                        <CardConsoTotal
                            title="Air"
                            currentValue={usineData.consoAir}
                            previousValue={usineData.consoAirPrec}
                            type="air"
                            baseUnit={baseUnitAir as BaseUnit}
                        />
                    </div>

                    {/* Cartes de secteur */}
                    <div className="grid-responsive-2">
                        {secteursData.map((secteur, index) => (
                            <SecteurConsoCard
                                key={index}
                                name={secteur.name}
                                consoElec={secteur.consoElec}
                                consoGaz={secteur.consoGaz}
                                consoEau={secteur.consoEau}
                                consoAir={secteur.consoAir}
                                consoElecPrec={secteur.consoElecPrec}
                                consoGazPrec={secteur.consoGazPrec}
                                consoEauPrec={secteur.consoEauPrec}
                                consoAirPrec={secteur.consoAirPrec}
                            />
                        ))}
                    </div>

                    {/* Graphiques de consommation par secteur */}
                    <div className="grid-responsive-2">
                        <ColumnChart
                            data={secteursData}
                            title="Consommation Électricité par Secteur"
                            type="elec"
                            onClickSecteur={(secteurName) => handleSecteurElecClick(secteurName)}
                            baseUnit={baseUnitElectricity as BaseUnit}
                        />
                        <ColumnChart
                            data={secteursData}
                            title="Consommation Gaz par Secteur"
                            type="gaz"
                            onClickSecteur={(secteurName) => handleSecteurGazClick(secteurName)}
                            baseUnit={baseUnitGas as BaseUnit}
                        />
                    </div>

                    <div className="grid-responsive-2">
                        <ColumnChart
                            data={secteursData}
                            title="Consommation Eau par Secteur"
                            type="eau"
                            onClickSecteur={(secteurName) => handleSecteurEauClick(secteurName)}
                            baseUnit={baseUnitWater as BaseUnit}
                        />
                        <ColumnChart
                            data={secteursData}
                            title="Consommation Air par Secteur"
                            type="air"
                            onClickSecteur={(secteurName) => handleSecteurAirClick(secteurName)}
                            baseUnit={baseUnitAir as BaseUnit}
                        />
                    </div>
                </div>
            </React.Fragment>
        </MantineProvider>
    );
};
