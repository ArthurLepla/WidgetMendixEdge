import { ReactElement, createElement, useState } from "react";
import { SyntheseWidgetPreviewProps } from "../typings/SyntheseWidgetProps";
import { CardConsoTotal } from "./components/CardConsoTotal";
import { ColumnChart } from "./components/ColumnChart";
import { SecteurConsoCard } from "./components/SecteurConsoCard";
import { DPE } from "./components/DPE";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { Big } from "big.js";

import "./ui/SyntheseWidget.compiled.css";

// Données de démonstration pour la prévisualisation avec des variations significatives
const demoData = {
    usine: {
        consoElec: new Big(1143.0),  // Valeur plus élevée pour montrer le DPE
        consoGaz: new Big(0.0),      // Valeur à 0 pour tester le cas des valeurs nulles
        consoEau: new Big(0.0),      // Valeur à 0 pour tester le cas des valeurs nulles
        consoAir: new Big(0.0),      // Valeur à 0 pour tester le cas des valeurs nulles
        consoElecPrec: new Big(700.0),  // +63.3% variation significative
        consoGazPrec: new Big(0.0),     // 0% variation
        consoEauPrec: new Big(0.0),     // 0% variation
        consoAirPrec: new Big(0.0)      // 0% variation
    },
    secteurs: [
        {
            name: "Production",
            consoElec: new Big(943.0),
            consoGaz: new Big(0),
            consoEau: new Big(0),
            consoAir: new Big(0),
            consoElecPrec: new Big(600.0),   // +57.2% variation
            consoGazPrec: new Big(0),
            consoEauPrec: new Big(0),
            consoAirPrec: new Big(0)
        },
        {
            name: "Utilités",
            consoElec: new Big(200.0),
            consoGaz: new Big(0),
            consoEau: new Big(0),
            consoAir: new Big(0),
            consoElecPrec: new Big(100.0),    // +100% variation
            consoGazPrec: new Big(0),
            consoEauPrec: new Big(0),
            consoAirPrec: new Big(0)
        }
    ]
};

export function preview({ class: className, styleObject }: SyntheseWidgetPreviewProps): ReactElement {
    const [activeButton, setActiveButton] = useState<'day' | 'week' | 'month'>('day');
    const dpeValue = demoData.usine.consoElec.toNumber();
    const dpeGrade = calculateDPEGrade(dpeValue, activeButton);

    return (
        <div className={className} style={styleObject}>
            <div className="mb-6">
                <DateRangeSelector
                    onClickDay={() => setActiveButton('day')}
                    onClickWeek={() => setActiveButton('week')}
                    onClickMonth={() => setActiveButton('month')}
                    activeButton={activeButton}
                />
            </div>

            <div className="grid-responsive-4 mb-6">
                <CardConsoTotal
                    title="Électricité"
                    currentValue={demoData.usine.consoElec}
                    previousValue={demoData.usine.consoElecPrec}
                    type="electricity"
                    baseUnit="kWh"
                />
                <CardConsoTotal
                    title="Gaz"
                    currentValue={demoData.usine.consoGaz}
                    previousValue={demoData.usine.consoGazPrec}
                    type="gas"
                    baseUnit="m3"
                />
                <CardConsoTotal
                    title="Eau"
                    currentValue={demoData.usine.consoEau}
                    previousValue={demoData.usine.consoEauPrec}
                    type="water"
                    baseUnit="m3"
                />
                <CardConsoTotal
                    title="Air"
                    currentValue={demoData.usine.consoAir}
                    previousValue={demoData.usine.consoAirPrec}
                    type="air"
                    baseUnit="m3"
                />
            </div>

            <div className="grid-responsive-2 mb-6">
                <ColumnChart 
                    data={demoData.secteurs} 
                    title="Consommation Électricité par Secteur"
                    type="elec"
                    baseUnit="kWh"
                />
                <DPE 
                    value={dpeValue}
                    grade={dpeGrade}
                    period={activeButton}
                    dsDPESettings={{ status: "available", items: [] } as any}
                    ThresholdA_Day={{} as any}
                    ThresholdB_Day={{} as any}
                    ThresholdC_Day={{} as any}
                    ThresholdD_Day={{} as any}
                    ThresholdE_Day={{} as any}
                    ThresholdF_Day={{} as any}
                    ThresholdA_Week={{} as any}
                    ThresholdB_Week={{} as any}
                    ThresholdC_Week={{} as any}
                    ThresholdD_Week={{} as any}
                    ThresholdE_Week={{} as any}
                    ThresholdF_Week={{} as any}
                    ThresholdA_Month={{} as any}
                    ThresholdB_Month={{} as any}
                    ThresholdC_Month={{} as any}
                    ThresholdD_Month={{} as any}
                    ThresholdE_Month={{} as any}
                    ThresholdF_Month={{} as any}
                    ThresholdA_Day_Form={{} as any}
                    ThresholdB_Day_Form={{} as any}
                    ThresholdC_Day_Form={{} as any}
                    ThresholdD_Day_Form={{} as any}
                    ThresholdE_Day_Form={{} as any}
                    ThresholdF_Day_Form={{} as any}
                    ThresholdA_Week_Form={{} as any}
                    ThresholdB_Week_Form={{} as any}
                    ThresholdC_Week_Form={{} as any}
                    ThresholdD_Week_Form={{} as any}
                    ThresholdE_Week_Form={{} as any}
                    ThresholdF_Week_Form={{} as any}
                    ThresholdA_Month_Form={{} as any}
                    ThresholdB_Month_Form={{} as any}
                    ThresholdC_Month_Form={{} as any}
                    ThresholdD_Month_Form={{} as any}
                    ThresholdE_Month_Form={{} as any}
                    ThresholdF_Month_Form={{} as any}
                    prepareAndSaveDPESettingsMF={undefined}
                />
            </div>

            <div className="grid-responsive-2 mb-6">
                <ColumnChart 
                    data={demoData.secteurs} 
                    title="Consommation Gaz par Secteur"
                    type="gaz"
                    baseUnit="m3"
                />
                <ColumnChart 
                    data={demoData.secteurs} 
                    title="Consommation Eau par Secteur"
                    type="eau"
                    baseUnit="m3"
                />
            </div>

            <div className="mb-6">
                <ColumnChart 
                    data={demoData.secteurs} 
                    title="Consommation Air par Secteur"
                    type="air"
                    baseUnit="m3"
                />
            </div>

            <div className="grid-responsive-2">
                {demoData.secteurs.map((secteur, index) => (
                    <SecteurConsoCard 
                        key={index} 
                        {...secteur}
                        baseUnitElectricity="kWh"
                        baseUnitGas="m3"
                        baseUnitWater="m3"
                        baseUnitAir="m3"
                    />
                ))}
            </div>
        </div>
    );
}

// Calcul du grade DPE basé sur la consommation électrique
const calculateDPEGrade = (value: number, period: 'day' | 'week' | 'month'): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' => {
    // Définir les seuils de base pour une journée
    const dailyThresholds = {
        A: 200,    // <= 200 kWh/jour
        B: 400,    // 201-400 kWh/jour
        C: 600,    // 401-600 kWh/jour
        D: 800,    // 601-800 kWh/jour
        E: 1000,   // 801-1000 kWh/jour
        F: 1200    // 1001-1200 kWh/jour
                   // > 1200 kWh/jour = G
    };

    // Calculer le multiplicateur en fonction de la période
    const multiplier = period === 'day' ? 1 : 
                      period === 'week' ? 7 : 
                      30; // pour un mois

    // Calculer les seuils ajustés
    const adjustedThresholds = {
        A: dailyThresholds.A * multiplier,
        B: dailyThresholds.B * multiplier,
        C: dailyThresholds.C * multiplier,
        D: dailyThresholds.D * multiplier,
        E: dailyThresholds.E * multiplier,
        F: dailyThresholds.F * multiplier
    };

    // Déterminer le grade en fonction de la valeur
    if (value <= adjustedThresholds.A) return 'A';
    if (value <= adjustedThresholds.B) return 'B';
    if (value <= adjustedThresholds.C) return 'C';
    if (value <= adjustedThresholds.D) return 'D';
    if (value <= adjustedThresholds.E) return 'E';
    if (value <= adjustedThresholds.F) return 'F';
    return 'G';
};

export function getPreviewCss(): string {
    return require("./ui/SyntheseWidget.compiled.css");
}
