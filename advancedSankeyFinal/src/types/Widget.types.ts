// Types pour le widget principal
export interface WidgetState {
    selectedNode: string | null;
    hoveredNode: string | null;
    debugMode: boolean;
}

export interface EnergyConfig {
    color: string;
    iconColor: string;
    titleColor: string;
    unit: string;
    title: string;
}

export interface EnergyConfigs {
    [key: string]: EnergyConfig;
}