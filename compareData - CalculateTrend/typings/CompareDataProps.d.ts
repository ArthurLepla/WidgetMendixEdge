/**
 * This file was generated from CompareData.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type ViewModeEnum = "energetic" | "ipe";

export type EnergyTypeEnum = "electricity" | "gas" | "water" | "air";

export type BaseUnitEnum = "auto" | "kWh" | "m3";

export type IpeModeEnum = "single" | "double";

export interface CompareDataContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    viewMode: ViewModeEnum;
    energyType: EnergyTypeEnum;
    baseUnit: BaseUnitEnum;
    ipeMode: IpeModeEnum;
    onAddProductionClick?: ActionValue;
    enableTestMode: boolean;
    enableAdvancedGranularity: boolean;
    ipe1Name: string;
    ipe2Name: string;
    selectedMachines?: ListValue;
    attrMachineName?: ListAttributeValue<string>;
    dsMesures?: ListValue;
    attrMachineMesureName?: ListAttributeValue<string>;
    attrTimestamp?: ListAttributeValue<Date>;
    attrConsommation?: ListAttributeValue<Big>;
    dateDebut?: EditableValue<Date>;
    dateFin?: EditableValue<Date>;
    selectedMachines2?: ListValue;
    attrMachineName2?: ListAttributeValue<string>;
    dsMesures2?: ListValue;
    attrMachineMesureName2?: ListAttributeValue<string>;
    attrTimestamp2?: ListAttributeValue<Date>;
    attrConsommation2?: ListAttributeValue<Big>;
    dateDebut2?: EditableValue<Date>;
    dateFin2?: EditableValue<Date>;
    dsProduction_Consommation?: ListValue;
    attrMachineProductionName?: ListAttributeValue<string>;
    attrProduction?: ListAttributeValue<Big>;
    attrConsommationIPE?: ListAttributeValue<Big>;
    dsProduction_Consommation2?: ListValue;
    attrMachineProductionName2?: ListAttributeValue<string>;
    attrProduction2?: ListAttributeValue<Big>;
    attrConsommationIPE2?: ListAttributeValue<Big>;
}

export interface CompareDataPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    viewMode: ViewModeEnum;
    energyType: EnergyTypeEnum;
    baseUnit: BaseUnitEnum;
    ipeMode: IpeModeEnum;
    onAddProductionClick: {} | null;
    enableTestMode: boolean;
    enableAdvancedGranularity: boolean;
    ipe1Name: string;
    ipe2Name: string;
    selectedMachines: {} | { caption: string } | { type: string } | null;
    attrMachineName: string;
    dsMesures: {} | { caption: string } | { type: string } | null;
    attrMachineMesureName: string;
    attrTimestamp: string;
    attrConsommation: string;
    dateDebut: string;
    dateFin: string;
    selectedMachines2: {} | { caption: string } | { type: string } | null;
    attrMachineName2: string;
    dsMesures2: {} | { caption: string } | { type: string } | null;
    attrMachineMesureName2: string;
    attrTimestamp2: string;
    attrConsommation2: string;
    dateDebut2: string;
    dateFin2: string;
    dsProduction_Consommation: {} | { caption: string } | { type: string } | null;
    attrMachineProductionName: string;
    attrProduction: string;
    attrConsommationIPE: string;
    dsProduction_Consommation2: {} | { caption: string } | { type: string } | null;
    attrMachineProductionName2: string;
    attrProduction2: string;
    attrConsommationIPE2: string;
}
