/**
 * This file was generated from SyntheseWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type BaseUnitElectricityEnum = "kWh" | "m3";

export type BaseUnitGasEnum = "kWh" | "m3";

export type BaseUnitWaterEnum = "kWh" | "m3";

export type BaseUnitAirEnum = "kWh" | "m3";

export interface SyntheseWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dsUsine: ListValue;
    attrTotalConsoElec: ListAttributeValue<Big>;
    attrTotalConsoGaz: ListAttributeValue<Big>;
    attrTotalConsoEau: ListAttributeValue<Big>;
    attrTotalConsoAir: ListAttributeValue<Big>;
    attrTotalConsoElecPeriodPrec: ListAttributeValue<Big>;
    attrTotalConsoGazPeriodPrec: ListAttributeValue<Big>;
    attrTotalConsoEauPeriodPrec: ListAttributeValue<Big>;
    attrTotalConsoAirPeriodPrec: ListAttributeValue<Big>;
    dsSecteurs: ListValue;
    attrSecteurNom: ListAttributeValue<string>;
    attrSecteurConsoElec: ListAttributeValue<Big>;
    attrSecteurConsoGaz: ListAttributeValue<Big>;
    attrSecteurConsoEau: ListAttributeValue<Big>;
    attrSecteurConsoAir: ListAttributeValue<Big>;
    attrSecteurConsoElecPrec: ListAttributeValue<Big>;
    attrSecteurConsoGazPrec: ListAttributeValue<Big>;
    attrSecteurConsoEauPrec: ListAttributeValue<Big>;
    attrSecteurConsoAirPrec: ListAttributeValue<Big>;
    dateDebut: EditableValue<Date>;
    dateFin: EditableValue<Date>;
    baseUnitElectricity: BaseUnitElectricityEnum;
    baseUnitGas: BaseUnitGasEnum;
    baseUnitWater: BaseUnitWaterEnum;
    baseUnitAir: BaseUnitAirEnum;
    onClickDay?: ActionValue;
    onClickWeek?: ActionValue;
    onClickMonth?: ActionValue;
    onClickSecteurElec?: ActionValue;
    onClickSecteurGaz?: ActionValue;
    onClickSecteurEau?: ActionValue;
    onClickSecteurAir?: ActionValue;
    dsDPESettings: ListValue;
    ThresholdA_Day: ListAttributeValue<Big>;
    ThresholdB_Day: ListAttributeValue<Big>;
    ThresholdC_Day: ListAttributeValue<Big>;
    ThresholdD_Day: ListAttributeValue<Big>;
    ThresholdE_Day: ListAttributeValue<Big>;
    ThresholdF_Day: ListAttributeValue<Big>;
    ThresholdA_Week: ListAttributeValue<Big>;
    ThresholdB_Week: ListAttributeValue<Big>;
    ThresholdC_Week: ListAttributeValue<Big>;
    ThresholdD_Week: ListAttributeValue<Big>;
    ThresholdE_Week: ListAttributeValue<Big>;
    ThresholdF_Week: ListAttributeValue<Big>;
    ThresholdA_Month: ListAttributeValue<Big>;
    ThresholdB_Month: ListAttributeValue<Big>;
    ThresholdC_Month: ListAttributeValue<Big>;
    ThresholdD_Month: ListAttributeValue<Big>;
    ThresholdE_Month: ListAttributeValue<Big>;
    ThresholdF_Month: ListAttributeValue<Big>;
    ThresholdA_Day_Form: EditableValue<Big>;
    ThresholdB_Day_Form: EditableValue<Big>;
    ThresholdC_Day_Form: EditableValue<Big>;
    ThresholdD_Day_Form: EditableValue<Big>;
    ThresholdE_Day_Form: EditableValue<Big>;
    ThresholdF_Day_Form: EditableValue<Big>;
    ThresholdA_Week_Form: EditableValue<Big>;
    ThresholdB_Week_Form: EditableValue<Big>;
    ThresholdC_Week_Form: EditableValue<Big>;
    ThresholdD_Week_Form: EditableValue<Big>;
    ThresholdE_Week_Form: EditableValue<Big>;
    ThresholdF_Week_Form: EditableValue<Big>;
    ThresholdA_Month_Form: EditableValue<Big>;
    ThresholdB_Month_Form: EditableValue<Big>;
    ThresholdC_Month_Form: EditableValue<Big>;
    ThresholdD_Month_Form: EditableValue<Big>;
    ThresholdE_Month_Form: EditableValue<Big>;
    ThresholdF_Month_Form: EditableValue<Big>;
    prepareAndSaveDPESettingsMF?: ActionValue;
    loadDPESettingsMF?: ActionValue;
    saveDPESettingsMF?: ActionValue;
}

export interface SyntheseWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dsUsine: {} | { caption: string } | { type: string } | null;
    attrTotalConsoElec: string;
    attrTotalConsoGaz: string;
    attrTotalConsoEau: string;
    attrTotalConsoAir: string;
    attrTotalConsoElecPeriodPrec: string;
    attrTotalConsoGazPeriodPrec: string;
    attrTotalConsoEauPeriodPrec: string;
    attrTotalConsoAirPeriodPrec: string;
    dsSecteurs: {} | { caption: string } | { type: string } | null;
    attrSecteurNom: string;
    attrSecteurConsoElec: string;
    attrSecteurConsoGaz: string;
    attrSecteurConsoEau: string;
    attrSecteurConsoAir: string;
    attrSecteurConsoElecPrec: string;
    attrSecteurConsoGazPrec: string;
    attrSecteurConsoEauPrec: string;
    attrSecteurConsoAirPrec: string;
    dateDebut: string;
    dateFin: string;
    baseUnitElectricity: BaseUnitElectricityEnum;
    baseUnitGas: BaseUnitGasEnum;
    baseUnitWater: BaseUnitWaterEnum;
    baseUnitAir: BaseUnitAirEnum;
    onClickDay: {} | null;
    onClickWeek: {} | null;
    onClickMonth: {} | null;
    onClickSecteurElec: {} | null;
    onClickSecteurGaz: {} | null;
    onClickSecteurEau: {} | null;
    onClickSecteurAir: {} | null;
    dsDPESettings: {} | { caption: string } | { type: string } | null;
    ThresholdA_Day: string;
    ThresholdB_Day: string;
    ThresholdC_Day: string;
    ThresholdD_Day: string;
    ThresholdE_Day: string;
    ThresholdF_Day: string;
    ThresholdA_Week: string;
    ThresholdB_Week: string;
    ThresholdC_Week: string;
    ThresholdD_Week: string;
    ThresholdE_Week: string;
    ThresholdF_Week: string;
    ThresholdA_Month: string;
    ThresholdB_Month: string;
    ThresholdC_Month: string;
    ThresholdD_Month: string;
    ThresholdE_Month: string;
    ThresholdF_Month: string;
    ThresholdA_Day_Form: string;
    ThresholdB_Day_Form: string;
    ThresholdC_Day_Form: string;
    ThresholdD_Day_Form: string;
    ThresholdE_Day_Form: string;
    ThresholdF_Day_Form: string;
    ThresholdA_Week_Form: string;
    ThresholdB_Week_Form: string;
    ThresholdC_Week_Form: string;
    ThresholdD_Week_Form: string;
    ThresholdE_Week_Form: string;
    ThresholdF_Week_Form: string;
    ThresholdA_Month_Form: string;
    ThresholdB_Month_Form: string;
    ThresholdC_Month_Form: string;
    ThresholdD_Month_Form: string;
    ThresholdE_Month_Form: string;
    ThresholdF_Month_Form: string;
    prepareAndSaveDPESettingsMF: {} | null;
    loadDPESettingsMF: {} | null;
    saveDPESettingsMF: {} | null;
}
