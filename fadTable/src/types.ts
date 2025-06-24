/**
 * Types et interfaces pour le widget FAD Table
 */

/**
 * Représente une ligne de données dans le tableau FAD
 */
export interface FadTableRow {
    id: string;
    machineName: string;
    atelierName?: string;
    secteurName?: string;

    // Valeurs de consommation pour l'année N
    janValue?: number;
    febValue?: number;
    marValue?: number;
    aprValue?: number;
    mayValue?: number;
    junValue?: number;
    julValue?: number;
    augValue?: number;
    sepValue?: number;
    octValue?: number;
    novValue?: number;
    decValue?: number;
    totalYearValue?: number;

    // Valeurs de consommation pour l'année N-1 (optionnelles)
    prevJanValue?: number;
    prevFebValue?: number;
    prevMarValue?: number;
    prevAprValue?: number;
    prevMayValue?: number;
    prevJunValue?: number;
    prevJulValue?: number;
    prevAugValue?: number;
    prevSepValue?: number;
    prevOctValue?: number;
    prevNovValue?: number;
    prevDecValue?: number;
    prevTotalYearValue?: number;

    // Métadonnées
    isTotal?: boolean;
    totalType?: TotalType;
    parentId?: string;
    isExpanded?: boolean;
}

/**
 * Types de totaux possibles
 */
export enum TotalType {
    ATELIER = "ATELIER",
    SECTEUR = "SECTEUR",
    GLOBAL = "GLOBAL"
}

/**
 * Définition d'une colonne du tableau
 */
export interface TableColumn {
    id: string;
    label: string;
    accessor: string;
    sortable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
    format?: (value: number | string | null | undefined) => string | number;
}
