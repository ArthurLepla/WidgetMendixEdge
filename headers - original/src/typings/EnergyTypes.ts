/**
 * Types pour les énergies utilisées dans l'application
 */

export type Color = string;

export type EnergyType = "electricity" | "gas" | "water" | "air";

export interface EnergyConfig {
    color: Color;
    iconColor: Color;
    titleColor: Color;
    BackgroundIconColor: Color;
}

export const ENERGY_CONFIG: Record<EnergyType, EnergyConfig> = {
    electricity: {
        color: '#38a13c',
        iconColor: '#38a13c',
        titleColor: '#38a13c',
        BackgroundIconColor: "rgba(56, 161, 60, 0.1)"
    },
    gas: {
        color: '#F9BE01',
        iconColor: '#F9BE01',
        titleColor: '#F9BE01',
        BackgroundIconColor: "rgba(249, 190, 1, 0.1)"
    },
    water: {
        color: '#3293f3',
        iconColor: '#3293f3',
        titleColor: '#3293f3',
        BackgroundIconColor: "rgba(50, 147, 243, 0.1)"
    },
    air: {
        color: '#66D8E6',
        iconColor: '#66D8E6',
        titleColor: '#66D8E6',
        BackgroundIconColor: "rgba(102, 216, 230, 0.1)"
    }
}; 