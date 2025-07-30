export type ViewMode = "energetic" | "ipe";
export type EnergyType = "electricity" | "gas" | "water" | "air";
export type BaseEnergyType = Exclude<EnergyType, "ipe">;

export interface EnergyConfig {
    label: string;
    color: string;
    unit: string;
    BackgroundIconColor: string;
    ipeUnit: string;
    baseUnit?: string; // Pour IPE
} 