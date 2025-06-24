import { ReactElement } from "react";
import { AdvancedSankeyV2PreviewProps } from "../typings/AdvancedSankeyV2Props";
import { Problem, Properties as MendixProperties } from "@mendix/pluggable-widgets-tools";
export type Platform = "web" | "desktop";
export type Properties = {
    caption: string;
    propertyGroups?: Properties[];
    properties?: Property[];
}[];
type Property = {
    key: string;
    caption: string;
    description?: string;
};
export declare function getProperties(values: AdvancedSankeyV2PreviewProps, defaultProperties: MendixProperties): MendixProperties;
export declare function check(values: AdvancedSankeyV2PreviewProps): Problem[];
export declare function getPreview(values: AdvancedSankeyV2PreviewProps, isDarkMode: boolean): ReactElement;
export declare function getCustomCaption(values: AdvancedSankeyV2PreviewProps): string;
export {};
//# sourceMappingURL=AdvancedSankeyV2.editorConfig.d.ts.map