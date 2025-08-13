/**
 * This file was generated from AdvancedSankeyV2.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type EnergyTypeEnum = "elec" | "gaz" | "eau" | "air";

export type MetricTypeEnum = "Conso" | "IPE" | "IPE_kg" | "Prod" | "Prod_kg";

export interface AdvancedSankeyV2ContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    energyFlowDataSource: ListValue;
    sourceAssetAttribute: ListAttributeValue<string>;
    targetAssetAttribute: ListAttributeValue<string>;
    flowValueAttribute: ListAttributeValue<Big>;
    percentageAttribute: ListAttributeValue<Big>;
    energyType: EnergyTypeEnum;
    metricType: MetricTypeEnum;
    title: string;
    width: number;
    height: number;
    showValues: boolean;
    onNodeClick?: ActionValue;
    onNodeDetails?: ActionValue;
    selectedAssetNameAttribute?: EditableValue<string>;
    showDebugTools: boolean;
}

export interface AdvancedSankeyV2PreviewProps {
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
    energyFlowDataSource: {} | { caption: string } | { type: string } | null;
    sourceAssetAttribute: string;
    targetAssetAttribute: string;
    flowValueAttribute: string;
    percentageAttribute: string;
    energyType: EnergyTypeEnum;
    metricType: MetricTypeEnum;
    title: string;
    width: number | null;
    height: number | null;
    showValues: boolean;
    onNodeClick: {} | null;
    onNodeDetails: {} | null;
    selectedAssetNameAttribute: string;
    showDebugTools: boolean;
}
