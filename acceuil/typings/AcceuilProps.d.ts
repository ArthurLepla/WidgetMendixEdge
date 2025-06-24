/**
 * This file was generated from Acceuil.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ListAttributeValue, WebImage } from "mendix";
import { Big } from "big.js";

export type ElectricityUnitEnum = "kWh" | "m3";

export type GasUnitEnum = "kWh" | "m3";

export type WaterUnitEnum = "kWh" | "m3";

export type AirUnitEnum = "kWh" | "m3";

export interface AcceuilContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    titleImage?: DynamicValue<WebImage>;
    title: string;
    subtitle: string;
    electricityDataSource?: ListValue;
    electricityValueAttribute?: ListAttributeValue<Big>;
    electricityUnit: ElectricityUnitEnum;
    gasDataSource?: ListValue;
    gasValueAttribute?: ListAttributeValue<Big>;
    gasUnit: GasUnitEnum;
    waterDataSource?: ListValue;
    waterValueAttribute?: ListAttributeValue<Big>;
    waterUnit: WaterUnitEnum;
    airDataSource?: ListValue;
    airValueAttribute?: ListAttributeValue<Big>;
    airUnit: AirUnitEnum;
    syntheticViewDataSource?: ListValue;
    syntheticViewTitle: string;
    syntheticViewDescription: string;
    syntheticViewButtonText: string;
    syntheticViewIcon?: ReactNode;
    onSyntheticViewClick?: ActionValue;
    globalViewDataSource?: ListValue;
    globalViewTitle: string;
    globalViewDescription: string;
    globalViewIcon?: ReactNode;
    onGlobalViewClick?: ActionValue;
    detailedViewDataSource?: ListValue;
    detailedViewTitle: string;
    detailedViewDescription: string;
    detailedViewIcon?: ReactNode;
    onDetailedViewClick?: ActionValue;
    reportsDataSource?: ListValue;
    reportsTitle: string;
    reportsDescription: string;
    reportsIcon?: ReactNode;
    onReportsClick?: ActionValue;
    dataEntryDataSource?: ListValue;
    dataEntryTitle: string;
    dataEntryDescription: string;
    dataEntryIcon?: ReactNode;
    onDataEntryClick?: ActionValue;
}

export interface AcceuilPreviewProps {
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
    titleImage: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    title: string;
    subtitle: string;
    electricityDataSource: {} | { caption: string } | { type: string } | null;
    electricityValueAttribute: string;
    electricityUnit: ElectricityUnitEnum;
    gasDataSource: {} | { caption: string } | { type: string } | null;
    gasValueAttribute: string;
    gasUnit: GasUnitEnum;
    waterDataSource: {} | { caption: string } | { type: string } | null;
    waterValueAttribute: string;
    waterUnit: WaterUnitEnum;
    airDataSource: {} | { caption: string } | { type: string } | null;
    airValueAttribute: string;
    airUnit: AirUnitEnum;
    syntheticViewDataSource: {} | { caption: string } | { type: string } | null;
    syntheticViewTitle: string;
    syntheticViewDescription: string;
    syntheticViewButtonText: string;
    syntheticViewIcon: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onSyntheticViewClick: {} | null;
    globalViewDataSource: {} | { caption: string } | { type: string } | null;
    globalViewTitle: string;
    globalViewDescription: string;
    globalViewIcon: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onGlobalViewClick: {} | null;
    detailedViewDataSource: {} | { caption: string } | { type: string } | null;
    detailedViewTitle: string;
    detailedViewDescription: string;
    detailedViewIcon: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onDetailedViewClick: {} | null;
    reportsDataSource: {} | { caption: string } | { type: string } | null;
    reportsTitle: string;
    reportsDescription: string;
    reportsIcon: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onReportsClick: {} | null;
    dataEntryDataSource: {} | { caption: string } | { type: string } | null;
    dataEntryTitle: string;
    dataEntryDescription: string;
    dataEntryIcon: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onDataEntryClick: {} | null;
}
