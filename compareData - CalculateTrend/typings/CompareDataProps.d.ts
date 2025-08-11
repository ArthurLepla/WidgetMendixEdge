/**
 * This file was generated from CompareData.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type ViewModeConfigEnum = "energetic" | "ipe";

export interface SelectedAssetType {
    selectedAssetName: EditableValue<string>;
}

export interface DateRangeType {
    startDateAttr: EditableValue<Date>;
    endDateAttr: EditableValue<Date>;
}

export interface SelectedAssetPreviewType {
    selectedAssetName: string;
}

export interface DateRangePreviewType {
    startDateAttr: string;
    endDateAttr: string;
}

export interface CompareDataContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    devMode: boolean;
    viewModeConfig: ViewModeConfigEnum;
    selectedAsset: SelectedAssetType[];
    dateRange: DateRangeType[];
    timeSeriesDataSource: ListValue;
    timestampAttr: ListAttributeValue<Date>;
    valueAttr: ListAttributeValue<Big>;
    assetNameAttr: ListAttributeValue<string>;
    metricTypeAttr?: ListAttributeValue<string>;
    energyTypeAttr?: ListAttributeValue<string>;
    assetVariablesDataSource?: ListValue;
    variableNameAttr?: ListAttributeValue<string>;
    variableUnitAttr?: ListAttributeValue<string>;
    variableMetricTypeAttr?: ListAttributeValue<string>;
    variableEnergyTypeAttr?: ListAttributeValue<string>;
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
    selectedAsset: SelectedAssetPreviewType[];
    dateRange: DateRangePreviewType[];
    timeSeriesDataSource: {} | { caption: string } | { type: string } | null;
    timestampAttr: string;
    valueAttr: string;
    assetNameAttr: string;
    metricTypeAttr: string;
    energyTypeAttr: string;
    assetVariablesDataSource: {} | { caption: string } | { type: string } | null;
    variableNameAttr: string;
    variableUnitAttr: string;
    variableMetricTypeAttr: string;
    variableEnergyTypeAttr: string;
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
    onAddProductionClick: {} | null;
}
