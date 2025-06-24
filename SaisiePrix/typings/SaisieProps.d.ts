/**
 * This file was generated from Saisie.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface SaisieContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    energyAttribute?: EditableValue<string>;
    tariffTypeAttribute?: EditableValue<string>;
    priceAttribute?: EditableValue<Big>;
    unitAttribute?: EditableValue<string>;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    historyDataSource?: ListValue;
    historyEnergyAttribute?: ListAttributeValue<string>;
    historyTariffTypeAttribute?: ListAttributeValue<string>;
    historyPriceAttribute?: ListAttributeValue<Big>;
    historyUnitAttribute?: ListAttributeValue<string>;
    historyStartDateAttribute?: ListAttributeValue<Date>;
    historyEndDateAttribute?: ListAttributeValue<Date>;
    historyCreationDateAttribute?: ListAttributeValue<Date>;
    onSaveAction?: ActionValue;
    onEditAction?: ListActionValue;
    onDeleteAction?: ListActionValue;
    backgroundColor: string;
    textColor: string;
}

export interface SaisiePreviewProps {
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
    energyAttribute: string;
    tariffTypeAttribute: string;
    priceAttribute: string;
    unitAttribute: string;
    startDateAttribute: string;
    endDateAttribute: string;
    historyDataSource: {} | { caption: string } | { type: string } | null;
    historyEnergyAttribute: string;
    historyTariffTypeAttribute: string;
    historyPriceAttribute: string;
    historyUnitAttribute: string;
    historyStartDateAttribute: string;
    historyEndDateAttribute: string;
    historyCreationDateAttribute: string;
    onSaveAction: {} | null;
    onEditAction: {} | null;
    onDeleteAction: {} | null;
    backgroundColor: string;
    textColor: string;
}
