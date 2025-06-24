export interface EnergyConfig {
    label: string;
    color: string;
    unit: string;
    BackgroundIconColor: string;
    ipeUnit: string;
}

export const energyConfigs: Record<string, EnergyConfig> = {
    electricity: {
        label: "Électricité",
        color: "#38a13c",
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)",
        unit: "kWh",
        ipeUnit: "pièces/kWh"
    },
    gas: {
        label: "Gaz",
        color: "#F9BE01",
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    water: {
        label: "Eau",
        color: "#3293f3",
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    air: {
        label: "Air",
        color: "#66D8E6",
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)",
        unit: "m³",
        ipeUnit: "pièces/m³"
    },
    IPE: {
        label: "IPE",
        color: "#be49ec",
        BackgroundIconColor: "rgba(190, 73, 236, 0.1)",
        unit: "pièces/kWh",
        ipeUnit: "pièces/kWh"
    }
};
