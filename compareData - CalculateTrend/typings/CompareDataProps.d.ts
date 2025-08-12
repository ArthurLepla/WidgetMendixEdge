/**
 * This file was generated from CompareData.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListReferenceValue } from "mendix";
import { Big } from "big.js";

export type ViewModeConfigEnum = "energetic" | "ipe";

export type EnergyTypeConfigEnum = "Elec" | "Gaz" | "Eau" | "Air";

export interface CompareDataContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    devMode: boolean;
    viewModeConfig: ViewModeConfigEnum;
    energyTypeConfig: EnergyTypeConfigEnum;
    selectedAssetNames: EditableValue<string>;
    assetsDataSource: ListValue;
    assetNameAttr: ListAttributeValue<string>;
    assetIsElecAttr?: ListAttributeValue<boolean>;
    assetIsGazAttr?: ListAttributeValue<boolean>;
    assetIsEauAttr?: ListAttributeValue<boolean>;
    assetIsAirAttr?: ListAttributeValue<boolean>;
    timeSeriesDataSource: ListValue;
    timestampAttr: ListAttributeValue<Date>;
    valueAttr: ListAttributeValue<Big>;
    tsAssetAssociation: ListReferenceValue;
    tsVariableAssociation?: ListReferenceValue;
    variablesDataSource?: ListValue;
    variableNameAttr?: ListAttributeValue<string>;
    variableUnitAttr?: ListAttributeValue<string>;
    variableMetricTypeAttr?: ListAttributeValue<string>;
    variableEnergyTypeAttr?: ListAttributeValue<string>;
    variableAssetAssociation?: ListReferenceValue;
    startDateAttr: EditableValue<Date>;
    endDateAttr: EditableValue<Date>;
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
    onAssetClick?: ListActionValue;
    onAddProductionClick?: ActionValue;
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
    devMode: boolean;
    viewModeConfig: ViewModeConfigEnum;
    energyTypeConfig: EnergyTypeConfigEnum;
    selectedAssetNames: string;
    assetsDataSource: {} | { caption: string } | { type: string } | null;
    assetNameAttr: string;
    assetIsElecAttr: string;
    assetIsGazAttr: string;
    assetIsEauAttr: string;
    assetIsAirAttr: string;
    timeSeriesDataSource: {} | { caption: string } | { type: string } | null;
    timestampAttr: string;
    valueAttr: string;
    tsAssetAssociation: string;
    tsVariableAssociation: string;
    variablesDataSource: {} | { caption: string } | { type: string } | null;
    variableNameAttr: string;
    variableUnitAttr: string;
    variableMetricTypeAttr: string;
    variableEnergyTypeAttr: string;
    variableAssetAssociation: string;
    startDateAttr: string;
    endDateAttr: string;
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
    onAssetClick: {} | null;
    onAddProductionClick: {} | null;
}
