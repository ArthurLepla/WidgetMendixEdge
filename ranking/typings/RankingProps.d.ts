/**
 * This file was generated from Ranking.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type ModeEnum = "Elec" | "gaz" | "eau" | "Air";

export type BaseUnitEnum = "kWh" | "m3";

export interface RankingContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    title: string;
    useDummyData: boolean;
    mode: ModeEnum;
    machineGroupEntity?: ListValue;
    machineNameAttribute?: ListAttributeValue<string>;
    consumptionAttribute?: ListAttributeValue<Big>;
    baseUnit: BaseUnitEnum;
    limitResults: number;
    highConsumptionColor: string;
    mediumConsumptionColor: string;
    lowConsumptionColor: string;
    dateStart: EditableValue<Date>;
    dateEnd: EditableValue<Date>;
}

export interface RankingPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    title: string;
    useDummyData: boolean;
    mode: ModeEnum;
    machineGroupEntity: {} | { caption: string } | { type: string } | null;
    machineNameAttribute: string;
    consumptionAttribute: string;
    baseUnit: BaseUnitEnum;
    limitResults: number | null;
    highConsumptionColor: string;
    mediumConsumptionColor: string;
    lowConsumptionColor: string;
    dateStart: string;
    dateEnd: string;
}
