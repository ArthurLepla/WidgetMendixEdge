import { ListValue, ListAttributeValue, ValueStatus } from "mendix";

export interface SmartVariableData {
    name: string;
    unit: string;
    metricType: string;
    energyType: string;
}

export function extractSmartVariablesData(
    assetVariablesDataSource: ListValue | undefined,
    variableNameAttr: ListAttributeValue<string> | undefined,
    variableUnitAttr: ListAttributeValue<string> | undefined,
    variableMetricTypeAttr: ListAttributeValue<string> | undefined,
    variableEnergyTypeAttr: ListAttributeValue<string> | undefined
): SmartVariableData[] {
    if (!assetVariablesDataSource || assetVariablesDataSource.status !== ValueStatus.Available) return [];
    if (!variableNameAttr || !variableUnitAttr || !variableMetricTypeAttr || !variableEnergyTypeAttr) return [];

    const items = assetVariablesDataSource.items ?? [];
    return items.map(item => ({
        name: variableNameAttr.get(item)?.value || "",
        unit: variableUnitAttr.get(item)?.value || "",
        metricType: variableMetricTypeAttr.get(item)?.value || "",
        energyType: variableEnergyTypeAttr.get(item)?.value || ""
    })).filter(v => v.name.length > 0);
}

export function getIPEVariantsFromVariables(
    variables: SmartVariableData[],
    targetEnergy: string
): Array<{ metricType: "IPE" | "IPE_kg"; unit: string }> {
    const variants: Array<{ metricType: "IPE" | "IPE_kg"; unit: string }> = [];
    const normalizedEnergy = (targetEnergy || "").toLowerCase();

    const matchEnergy = (vEnergy: string) => {
        const e = (vEnergy || "").toLowerCase();
        if (!normalizedEnergy) return true;
        // tolérance simple (elec/élec, gaz/gas...)
        if (normalizedEnergy.startsWith("elec")) return e.includes("elec") || e.includes("élec");
        if (normalizedEnergy.startsWith("gaz") || normalizedEnergy.startsWith("gas")) return e.includes("gaz") || e.includes("gas");
        if (normalizedEnergy.startsWith("eau") || normalizedEnergy.startsWith("water")) return e.includes("eau") || e.includes("water");
        if (normalizedEnergy.startsWith("air")) return e.includes("air");
        return e.includes(normalizedEnergy);
    };

    const ipe = variables.find(v => v.metricType === "IPE" && matchEnergy(v.energyType));
    const ipeKg = variables.find(v => v.metricType === "IPE_kg" && matchEnergy(v.energyType));

    if (ipeKg) variants.push({ metricType: "IPE_kg", unit: ipeKg.unit });
    if (ipe) variants.push({ metricType: "IPE", unit: ipe.unit });
    return variants;
}

export function getSmartIPEUnits(
    variables: SmartVariableData[],
    targetEnergy: string
): { ipe1Unit?: string; ipe2Unit?: string } {
    const variants = getIPEVariantsFromVariables(variables, targetEnergy);
    const ipe1 = variants.find(v => v.metricType === "IPE_kg");
    const ipe2 = variants.find(v => v.metricType === "IPE");
    return {
        ipe1Unit: ipe1?.unit,
        ipe2Unit: ipe2?.unit
    };
}


