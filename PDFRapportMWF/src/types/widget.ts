import { GUID, ObjectItem } from "mendix";

// Types pour la machine à états finie (FSM)
export type ComponentStep = "idle" | "fetchingInitialData" | "processingPdfData" | "readyForDownload" | "error";

// Structure pour les données traitées du widget
export interface ProcessedDataItem {
    id: GUID;
    levelType: string;
    displayName: string;
    parentNames: { [description: string]: string };
    consumption: {
        [energyType: string]: number | undefined;
    };
    production?: number;
    ipe?: number;
    totalConsumptionForIpe?: number;
    originalItem: ObjectItem;
    children?: ProcessedDataItem[];
    levelDepth?: number;
}

// Interface pour la prévisualisation des données
export interface DataPreview {
    secteurs: number;
    ateliers: number; 
    machines: number;
}

// Interfaces pour les composants PDF
export interface PDFDocumentProps {
    reportTitle: string;
    reportDescription?: string;
    logoUrl?: string;
    treeData: ProcessedDataItem[]; 
    dateStart?: Date;
    dateEnd?: Date;
}

export interface TableRenderProps {
    items: ProcessedDataItem[];
    title: string;
    columnName: string;
}

export interface IPETableRenderProps extends TableRenderProps {
    separateFromMain?: boolean;
}

// Interface pour la pagination intelligente
export interface PaginationConfig {
    separateTables: boolean;
    mainChunks: number[];
    ipeChunks: number[];
}

// Interface pour les calculs de totaux
export interface EnergyTotals {
    totalElec: number;
    totalGaz: number;
    totalAir: number;
    totalProduction: number;
}

// Interface pour les IPE par énergie
export interface IPEByEnergy {
    ipeElec?: number;
    ipeGaz?: number;
    ipeAir?: number;
}

// Props pour le composant DateRangePicker
export interface DateRangePickerProps {
    value: [Date | null, Date | null];
    onChange: (dates: [Date | null, Date | null]) => void;
    disabled?: boolean;
}

// Props pour les composants UI réutilisables
export interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
}

export interface StatisticProps {
    title: string;
    value: number | string;
    valueStyle?: React.CSSProperties;
    style?: React.CSSProperties;
}

// Types pour les actions de bouton intelligent
export type SmartButtonAction = 'loadData' | 'downloadPDF' | 'disabled';

// Interface pour le contexte du stepper
export interface StepperState {
    currentIndex: number;
    hasValidDates: boolean;
    isProcessing: boolean;
    currentStep: ComponentStep;
} 