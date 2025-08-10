import type { ListValue, ListAttributeValue } from "mendix";

export type SmartMetricType = "Conso" | "IPE" | "IPE_kg" | "Prod" | "Prod_kg" | "Custom";
export type SmartEnergyType = "Elec" | "Gaz" | "Eau" | "Air" | "None";

export interface SmartVariableData {
  name: string;
  unit: string;
  metricType: SmartMetricType | string;
  energyType: SmartEnergyType | string;
}

export function extractSmartVariablesData(
  assetVariablesDataSource?: ListValue,
  variableNameAttr?: ListAttributeValue<string>,
  variableUnitAttr?: ListAttributeValue<string>,
  variableMetricTypeAttr?: ListAttributeValue<string>,
  variableEnergyTypeAttr?: ListAttributeValue<string>
): SmartVariableData[] {
  if (!assetVariablesDataSource || assetVariablesDataSource.status !== "available" || !assetVariablesDataSource.items) {
    return [];
  }

  return assetVariablesDataSource.items.map(item => {
    const name = variableNameAttr?.get(item).value ?? "";
    const unit = variableUnitAttr?.get(item).value ?? "";
    const metricType = (variableMetricTypeAttr?.get(item).value as string | undefined) ?? "";
    const energyType = (variableEnergyTypeAttr?.get(item).value as string | undefined) ?? "";
    return { name, unit, metricType, energyType };
  });
}

function fallbackIpeUnit(energy: SmartEnergyType | string, variant: "kg" | "pcs"): string {
  const isElec = energy === "Elec";
  const base = isElec ? "kWh" : "m³";
  return variant === "kg" ? `${base}/kg` : `${base}/pcs`;
}

function normalizeEnergyFromWidget(widgetEnergy: string | undefined): SmartEnergyType | undefined {
  if (!widgetEnergy) return undefined;
  // Accept both Mendix Detailswidget enum (Elec/Gaz/Eau/Air) and CompareData energyType mapping
  const map: Record<string, SmartEnergyType> = {
    Elec: "Elec",
    Gaz: "Gaz",
    Eau: "Eau",
    Air: "Air",
    electricity: "Elec",
    gas: "Gaz",
    water: "Eau",
    air: "Air",
  };
  return map[widgetEnergy];
}

export function getSmartIPEUnits(
  variables: SmartVariableData[],
  widgetEnergyType: string | undefined
): { ipe1Unit: string; ipe2Unit: string } {
  const energy = normalizeEnergyFromWidget(widgetEnergyType) ?? "Elec";

  const byEnergy = variables.filter(v => (v.energyType as string) === energy);

  const ipeKg = byEnergy.find(v => v.metricType === "IPE_kg");
  const ipe = byEnergy.find(v => v.metricType === "IPE");

  const ipe1Unit = ipeKg?.unit?.trim() || fallbackIpeUnit(energy, "kg");
  const ipe2Unit = ipe?.unit?.trim() || fallbackIpeUnit(energy, "pcs");

  return { ipe1Unit, ipe2Unit };
}

