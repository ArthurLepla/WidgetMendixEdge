/**
 * This file was generated from PDFReportWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, WebImage } from "mendix";

export type ChartTypeEnum = "line" | "bar" | "pie";

export interface PDFReportWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    reportTitle: string;
    reportDescription?: DynamicValue<string>;
    companyLogo?: DynamicValue<WebImage>;
    fetchDataAction?: ActionValue;
    assetDataSource: ListValue;
    dateStart: EditableValue<Date>;
    dateEnd: EditableValue<Date>;
    showCharts: boolean;
    chartType: ChartTypeEnum;
}

export interface PDFReportWidgetPreviewProps {
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
    reportTitle: string;
    reportDescription: string;
    companyLogo: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    fetchDataAction: {} | null;
    assetDataSource: {} | { caption: string } | { type: string } | null;
    dateStart: string;
    dateEnd: string;
    showCharts: boolean;
    chartType: ChartTypeEnum;
}
