/**
 * This file was generated from AssetTableau.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";

export type ModeEnum = "dev" | "prod";

export interface AssetTableauContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    mode: ModeEnum;
    maxLevels: number;
    updateBufferAttribute?: EditableValue<string>;
    level1DataSource: ListValue;
    level1Name: string;
    level1NameAttribute: ListAttributeValue<string>;
    level1ParentAttribute?: ListAttributeValue<string>;
    level1UnitAttribute?: ListAttributeValue<string>;
    level1UpdateAction?: ListActionValue;
    level2DataSource?: ListValue;
    level2Name: string;
    level2NameAttribute?: ListAttributeValue<string>;
    level2ParentAttribute?: ListAttributeValue<string>;
    level2UnitAttribute?: ListAttributeValue<string>;
    level2UpdateAction?: ListActionValue;
    level3DataSource?: ListValue;
    level3Name: string;
    level3NameAttribute?: ListAttributeValue<string>;
    level3ParentAttribute?: ListAttributeValue<string>;
    level3UnitAttribute?: ListAttributeValue<string>;
    level3UpdateAction?: ListActionValue;
    level4DataSource?: ListValue;
    level4Name: string;
    level4NameAttribute?: ListAttributeValue<string>;
    level4ParentAttribute?: ListAttributeValue<string>;
    level4UnitAttribute?: ListAttributeValue<string>;
    level4UpdateAction?: ListActionValue;
    level5DataSource?: ListValue;
    level5Name: string;
    level5NameAttribute?: ListAttributeValue<string>;
    level5ParentAttribute?: ListAttributeValue<string>;
    level5UnitAttribute?: ListAttributeValue<string>;
    level5UpdateAction?: ListActionValue;
    allowEdit: boolean;
    allowDelete: boolean;
    allowCreate: boolean;
    onRefreshAction?: ActionValue;
    showSearch: boolean;
    showFilters: boolean;
    expandedByDefault: boolean;
}

export interface AssetTableauPreviewProps {
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
    mode: ModeEnum;
    maxLevels: number | null;
    updateBufferAttribute: string;
    level1DataSource: {} | { caption: string } | { type: string } | null;
    level1Name: string;
    level1NameAttribute: string;
    level1ParentAttribute: string;
    level1UnitAttribute: string;
    level1UpdateAction: {} | null;
    level2DataSource: {} | { caption: string } | { type: string } | null;
    level2Name: string;
    level2NameAttribute: string;
    level2ParentAttribute: string;
    level2UnitAttribute: string;
    level2UpdateAction: {} | null;
    level3DataSource: {} | { caption: string } | { type: string } | null;
    level3Name: string;
    level3NameAttribute: string;
    level3ParentAttribute: string;
    level3UnitAttribute: string;
    level3UpdateAction: {} | null;
    level4DataSource: {} | { caption: string } | { type: string } | null;
    level4Name: string;
    level4NameAttribute: string;
    level4ParentAttribute: string;
    level4UnitAttribute: string;
    level4UpdateAction: {} | null;
    level5DataSource: {} | { caption: string } | { type: string } | null;
    level5Name: string;
    level5NameAttribute: string;
    level5ParentAttribute: string;
    level5UnitAttribute: string;
    level5UpdateAction: {} | null;
    allowEdit: boolean;
    allowDelete: boolean;
    allowCreate: boolean;
    onRefreshAction: {} | null;
    showSearch: boolean;
    showFilters: boolean;
    expandedByDefault: boolean;
}
