/**
 * This file was generated from AdvancedSankeyV2.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface HierarchyConfigType {
    levelId: string;
    levelName: string;
    levelOrder: number;
    entityPath: ListValue;
    nameAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;
    energyTypeAttribute?: ListAttributeValue<string>;
    parentLevel0NameAttribute?: ListAttributeValue<string>;
    parentLevel1NameAttribute?: ListAttributeValue<string>;
    parentLevel2NameAttribute?: ListAttributeValue<string>;
    parentLevel3NameAttribute?: ListAttributeValue<string>;
    parentLevel4NameAttribute?: ListAttributeValue<string>;
    color: string;
    levelClickedItemAttribute?: EditableValue<string>;
    levelOnItemClick?: ActionValue;
}

export type SelectedEnergiesEnum = "all" | "elec" | "gaz" | "eau" | "air";

export interface HierarchyConfigPreviewType {
    levelId: string;
    levelName: string;
    levelOrder: number | null;
    entityPath: {} | { caption: string } | { type: string } | null;
    nameAttribute: string;
    valueAttribute: string;
    energyTypeAttribute: string;
    parentLevel0NameAttribute: string;
    parentLevel1NameAttribute: string;
    parentLevel2NameAttribute: string;
    parentLevel3NameAttribute: string;
    parentLevel4NameAttribute: string;
    color: string;
    levelClickedItemAttribute: string;
    levelOnItemClick: {} | null;
}

export interface AdvancedSankeyV2ContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    hierarchyConfig: HierarchyConfigType[];
    clickedItemAttribute?: EditableValue<string>;
    onItemClick?: ActionValue;
    onLastLevelClick?: ActionValue;
    title: string;
    selectedEnergies: SelectedEnergiesEnum;
    startDate?: EditableValue<Date>;
    endDate?: EditableValue<Date>;
    unitOfMeasure: string;
    priceDataSource?: ListValue;
    priceAttribute?: ListAttributeValue<Big>;
    priceEnergyTypeAttribute?: ListAttributeValue<string>;
    priceStartDateAttribute?: ListAttributeValue<Date>;
    priceEndDateAttribute?: ListAttributeValue<Date>;
    currency: string;
    onNoPriceClick?: ActionValue;
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
    renderMode?: "design" | "xray" | "structure";
    hierarchyConfig: HierarchyConfigPreviewType[];
    clickedItemAttribute: string;
    onItemClick: {} | null;
    onLastLevelClick: {} | null;
    title: string;
    selectedEnergies: SelectedEnergiesEnum;
    startDate: string;
    endDate: string;
    unitOfMeasure: string;
    priceDataSource: {} | { caption: string } | { type: string } | null;
    priceAttribute: string;
    priceEnergyTypeAttribute: string;
    priceStartDateAttribute: string;
    priceEndDateAttribute: string;
    currency: string;
    onNoPriceClick: {} | null;
    showDebugTools: boolean;
}
