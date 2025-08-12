import { ReactElement, createElement } from "react";
import { AdvancedSankeyV2PreviewProps } from "../typings/AdvancedSankeyV2Props";
import { hidePropertiesIn, Problem, Properties as MendixProperties } from "@mendix/pluggable-widgets-tools";

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

export function getProperties(values: AdvancedSankeyV2PreviewProps, defaultProperties: MendixProperties): MendixProperties {
    return defaultProperties;
}

export function check(values: AdvancedSankeyV2PreviewProps): Problem[] {
    const errors: Problem[] = [];

    // Vérification de la source de données EnergyFlowNode
    if (!values.energyFlowDataSource) {
        errors.push({
            property: "energyFlowDataSource",
            message: "La source de données EnergyFlowNode est requise."
        });
    }

    // Vérifications des attributs requis
    if (!values.sourceAssetAttribute) {
        errors.push({
            property: "sourceAssetAttribute",
            message: "L'attribut Asset source est requis."
        });
    }

    if (!values.targetAssetAttribute) {
        errors.push({
            property: "targetAssetAttribute", 
            message: "L'attribut Asset cible est requis."
        });
    }

    if (!values.flowValueAttribute) {
        errors.push({
            property: "flowValueAttribute",
            message: "L'attribut Valeur du flux est requis."
        });
    }

    if (!values.percentageAttribute) {
        errors.push({
            property: "percentageAttribute",
            message: "L'attribut Pourcentage est requis."
        });
    }

    return errors;
}

export function getPreview(values: AdvancedSankeyV2PreviewProps, isDarkMode: boolean): ReactElement {
    return createElement(
        "div",
        {
            style: {
                border: "1px dashed #ccc",
                height: "400px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: isDarkMode ? "#FFFFFF" : "#000000",
                backgroundColor: isDarkMode ? "#454545" : "#FFFFFF"
            }
        },
        createElement("div", null, "Advanced Sankey Diagram Preview (EnergyFlowNode)"),
        createElement("div", null, values.title || "Diagramme Sankey"),
        createElement("div", null, `Type: ${values.energyType} - Métrique: ${values.metricType}`)
    );
}

export function getCustomCaption(values: AdvancedSankeyV2PreviewProps): string {
    return values.title || "Advanced Sankey Diagram";
}