/**
 * This file was generated from Headers.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, WebIcon } from "mendix";

export interface BreadcrumbItemsType {
    label: string;
    icon?: DynamicValue<WebIcon>;
    action?: ActionValue;
}

export type SelectedEnergyEnum = "none" | "electricity" | "gas" | "water" | "air";

export interface FirstGroupButtonsType {
    label: string;
    icon?: DynamicValue<WebIcon>;
    action?: ActionValue;
    defaultSelected: boolean;
}

export interface SecondGroupButtonsType {
    label: string;
    icon?: DynamicValue<WebIcon>;
    action?: ActionValue;
    defaultSelected: boolean;
}

export interface BreadcrumbItemsPreviewType {
    label: string;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    action: {} | null;
}

export interface FirstGroupButtonsPreviewType {
    label: string;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    action: {} | null;
    defaultSelected: boolean;
}

export interface SecondGroupButtonsPreviewType {
    label: string;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    action: {} | null;
    defaultSelected: boolean;
}

export interface HeadersContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    homeAction?: ActionValue;
    headerTitle: string;
    showHeaderTitle: boolean;
    breadcrumbItems: BreadcrumbItemsType[];
    energySelectorEnabled: boolean;
    electricityEnabled: boolean;
    gasEnabled: boolean;
    waterEnabled: boolean;
    airEnabled: boolean;
    selectedEnergy: SelectedEnergyEnum;
    onElectricitySelect?: ActionValue;
    onGasSelect?: ActionValue;
    onWaterSelect?: ActionValue;
    onAirSelect?: ActionValue;
    multiSelectorEnabled: boolean;
    allowMultipleSelection: boolean;
    itemsDataSource?: ListValue;
    itemNameAttribute?: ListAttributeValue<string>;
    selectedItemsAttribute?: EditableValue<string>;
    parentNameAttribute?: ListAttributeValue<string>;
    levelAttribute?: ListAttributeValue<string>;
    onChange?: ActionValue;
    onSelectionChange?: ActionValue;
    dateRangePickerEnabled: boolean;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onDateChange?: ActionValue;
    buttonGroupEnabled: boolean;
    firstGroupName: string;
    firstGroupButtons: FirstGroupButtonsType[];
    secondGroupName: string;
    secondGroupButtons: SecondGroupButtonsType[];
}

export interface HeadersPreviewProps {
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
    homeAction: {} | null;
    headerTitle: string;
    showHeaderTitle: boolean;
    breadcrumbItems: BreadcrumbItemsPreviewType[];
    energySelectorEnabled: boolean;
    electricityEnabled: boolean;
    gasEnabled: boolean;
    waterEnabled: boolean;
    airEnabled: boolean;
    selectedEnergy: SelectedEnergyEnum;
    onElectricitySelect: {} | null;
    onGasSelect: {} | null;
    onWaterSelect: {} | null;
    onAirSelect: {} | null;
    multiSelectorEnabled: boolean;
    allowMultipleSelection: boolean;
    itemsDataSource: {} | { caption: string } | { type: string } | null;
    itemNameAttribute: string;
    selectedItemsAttribute: string;
    parentNameAttribute: string;
    levelAttribute: string;
    onChange: {} | null;
    onSelectionChange: {} | null;
    dateRangePickerEnabled: boolean;
    startDateAttribute: string;
    endDateAttribute: string;
    onDateChange: {} | null;
    buttonGroupEnabled: boolean;
    firstGroupName: string;
    firstGroupButtons: FirstGroupButtonsPreviewType[];
    secondGroupName: string;
    secondGroupButtons: SecondGroupButtonsPreviewType[];
}
