/**
 * This file was generated from AdminPanel.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue, ListActionValue, ListAttributeValue, ListReferenceValue } from "mendix";

export interface AdminPanelContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    assetsDatasource: ListValue;
    variablesDatasource?: ListValue;
    levelsDatasource?: ListValue;
    syncAction?: ActionValue;
    featuresDatasource: ListValue;
    onFeatureToggle?: ListActionValue;
    assetName: ListAttributeValue<string>;
    assetIsElec?: ListAttributeValue<boolean>;
    assetIsGaz?: ListAttributeValue<boolean>;
    assetIsEau?: ListAttributeValue<boolean>;
    assetIsAir?: ListAttributeValue<boolean>;
    assetParent?: ListReferenceValue;
    assetHasChildren?: ListAttributeValue<boolean>;
    assetLevel?: ListReferenceValue;
    featureName: ListAttributeValue<string>;
    featureIsEnabled: ListAttributeValue<boolean>;
    featureConfigValue?: ListAttributeValue<string>;
    variableName?: ListAttributeValue<string>;
    variableUnit?: ListAttributeValue<string>;
    variableType?: ListAttributeValue<string>;
    variableAsset?: ListReferenceValue;
}

export interface AdminPanelPreviewProps {
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
    assetsDatasource: {} | { caption: string } | { type: string } | null;
    variablesDatasource: {} | { caption: string } | { type: string } | null;
    levelsDatasource: {} | { caption: string } | { type: string } | null;
    syncAction: {} | null;
    featuresDatasource: {} | { caption: string } | { type: string } | null;
    onFeatureToggle: {} | null;
    assetName: string;
    assetIsElec: string;
    assetIsGaz: string;
    assetIsEau: string;
    assetIsAir: string;
    assetParent: string;
    assetHasChildren: string;
    assetLevel: string;
    featureName: string;
    featureIsEnabled: string;
    featureConfigValue: string;
    variableName: string;
    variableUnit: string;
    variableType: string;
    variableAsset: string;
}
