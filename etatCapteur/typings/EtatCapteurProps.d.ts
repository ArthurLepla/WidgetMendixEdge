/**
 * This file was generated from EtatCapteur.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue, ListAttributeValue } from "mendix";

export interface EtatCapteurContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    sensorDataSource: ListValue;
    nameAttribute: ListAttributeValue<string>;
    statusAttribute: ListAttributeValue<string>;
    lastUpdateAttribute?: ListAttributeValue<string>;
    refreshAction?: ActionValue;
    tableTitle: string;
    showIcons: boolean;
    showLastUpdate: boolean;
}

export interface EtatCapteurPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    sensorDataSource: {} | { caption: string } | { type: string } | null;
    nameAttribute: string;
    statusAttribute: string;
    lastUpdateAttribute: string;
    refreshAction: {} | null;
    tableTitle: string;
    showIcons: boolean;
    showLastUpdate: boolean;
}
