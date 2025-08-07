/**
 * This file was generated from Detailswidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, WebIcon } from "mendix";
import { Big } from "big.js";

export type ViewModeEnum = "energetic" | "ipe";

export type EnergyTypeEnum = "electricity" | "gas" | "water" | "air" | "IPE";

export interface DetailswidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    devMode: boolean;
    viewMode: ViewModeEnum;
    energyType: EnergyTypeEnum;
    consumptionDataSource?: ListValue;
    timestampAttr?: ListAttributeValue<Date>;
    consumptionAttr?: ListAttributeValue<Big>;
    NameAttr?: ListAttributeValue<string>;
    metricTypeAttr?: ListAttributeValue<string>;
    energyTypeAttr?: ListAttributeValue<string>;
    startDate?: EditableValue<Date>;
    endDate?: EditableValue<Date>;
    card1Title: string;
    card1Icon?: DynamicValue<WebIcon>;
    card1Unit: string;
    card1DataSource?: ListValue;
    card1ValueAttr?: ListAttributeValue<Big>;
    card2Title: string;
    card2Icon?: DynamicValue<WebIcon>;
    card2Unit: string;
    card2DataSource?: ListValue;
    card2ValueAttr?: ListAttributeValue<Big>;
    card3Title: string;
    card3Icon?: DynamicValue<WebIcon>;
    card3Unit: string;
    card3DataSource?: ListValue;
    card3ValueAttr?: ListAttributeValue<Big>;
    consumptionDataSource2?: ListValue;
    timestampAttr2?: ListAttributeValue<Date>;
    consumptionAttr2?: ListAttributeValue<Big>;
    NameAttr2?: ListAttributeValue<string>;
    metricTypeAttr2?: ListAttributeValue<string>;
    energyTypeAttr2?: ListAttributeValue<string>;
    startDate2?: EditableValue<Date>;
    endDate2?: EditableValue<Date>;
    card1Title2: string;
    card1Icon2?: DynamicValue<WebIcon>;
    card1Unit2: string;
    card1DataSource2?: ListValue;
    card1ValueAttr2?: ListAttributeValue<Big>;
    card2Title2: string;
    card2Icon2?: DynamicValue<WebIcon>;
    card2Unit2: string;
    card2DataSource2?: ListValue;
    card2ValueAttr2?: ListAttributeValue<Big>;
    card3Title2: string;
    card3Icon2?: DynamicValue<WebIcon>;
    card3Unit2: string;
    card3DataSource2?: ListValue;
    card3ValueAttr2?: ListAttributeValue<Big>;
    ipe1Name: string;
    ipe2Name: string;
    displayModeAttr?: EditableValue<string>;
    displayTimeAttr?: EditableValue<Big>;
    displayUnitAttr?: EditableValue<string>;
    displayPreviewOKAttr?: EditableValue<boolean>;
    bufferModeAttr?: EditableValue<string>;
    bufferTimeAttr?: EditableValue<Big>;
    bufferUnitAttr?: EditableValue<string>;
    onModeChange?: ActionValue;
    onTimeChange?: ActionValue;
    featureList?: ListValue;
    featureNameAttr?: ListAttributeValue<string>;
    assetVariablesDataSource?: ListValue;
    variableNameAttr?: ListAttributeValue<string>;
    variableUnitAttr?: ListAttributeValue<string>;
    variableMetricTypeAttr?: ListAttributeValue<string>;
    variableEnergyTypeAttr?: ListAttributeValue<string>;
}

export interface DetailswidgetPreviewProps {
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
    devMode: boolean;
    viewMode: ViewModeEnum;
    energyType: EnergyTypeEnum;
    consumptionDataSource: {} | { caption: string } | { type: string } | null;
    timestampAttr: string;
    consumptionAttr: string;
    NameAttr: string;
    metricTypeAttr: string;
    energyTypeAttr: string;
    startDate: string;
    endDate: string;
    card1Title: string;
    card1Icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card1Unit: string;
    card1DataSource: {} | { caption: string } | { type: string } | null;
    card1ValueAttr: string;
    card2Title: string;
    card2Icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card2Unit: string;
    card2DataSource: {} | { caption: string } | { type: string } | null;
    card2ValueAttr: string;
    card3Title: string;
    card3Icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card3Unit: string;
    card3DataSource: {} | { caption: string } | { type: string } | null;
    card3ValueAttr: string;
    consumptionDataSource2: {} | { caption: string } | { type: string } | null;
    timestampAttr2: string;
    consumptionAttr2: string;
    NameAttr2: string;
    metricTypeAttr2: string;
    energyTypeAttr2: string;
    startDate2: string;
    endDate2: string;
    card1Title2: string;
    card1Icon2: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card1Unit2: string;
    card1DataSource2: {} | { caption: string } | { type: string } | null;
    card1ValueAttr2: string;
    card2Title2: string;
    card2Icon2: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card2Unit2: string;
    card2DataSource2: {} | { caption: string } | { type: string } | null;
    card2ValueAttr2: string;
    card3Title2: string;
    card3Icon2: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    card3Unit2: string;
    card3DataSource2: {} | { caption: string } | { type: string } | null;
    card3ValueAttr2: string;
    ipe1Name: string;
    ipe2Name: string;
    displayModeAttr: string;
    displayTimeAttr: string;
    displayUnitAttr: string;
    displayPreviewOKAttr: string;
    bufferModeAttr: string;
    bufferTimeAttr: string;
    bufferUnitAttr: string;
    onModeChange: {} | null;
    onTimeChange: {} | null;
    featureList: {} | { caption: string } | { type: string } | null;
    featureNameAttr: string;
    assetVariablesDataSource: {} | { caption: string } | { type: string } | null;
    variableNameAttr: string;
    variableUnitAttr: string;
    variableMetricTypeAttr: string;
    variableEnergyTypeAttr: string;
}
