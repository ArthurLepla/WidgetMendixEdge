// Types pour les données de consommation énergétique

// Objet pour les valeurs mensuelles
export interface MonthlyValues {
    [key: string]: number;
}

// Structure pour une entrée de données de consommation
export interface EnergyData {
    id?: string; // Identifiant unique (optionnel)
    machineName: string; // Nom de la machine
    atelierName?: string; // Nom de l'atelier (optionnel)
    secteurName?: string; // Nom du secteur (optionnel)
    monthlyValues: MonthlyValues; // Valeurs mensuelles de l'année en cours
    yearTotal: number; // Total annuel de l'année en cours
    previousYearValues?: MonthlyValues; // Valeurs mensuelles de l'année précédente (optionnel)
    previousYearTotal?: number; // Total annuel de l'année précédente (optionnel)

    // Propriétés pour la hiérarchie flexible (optionnelles)
    niveau1Name?: string; // Nom du niveau 1 (ex: Site)
    niveau2Name?: string; // Nom du niveau 2 (ex: Bâtiment)
    niveau3Name?: string; // Nom du niveau 3 (ex: Étage)
    niveau4Name?: string; // Nom du niveau 4
    niveau5Name?: string; // Nom du niveau 5
    niveau6Name?: string; // Nom du niveau 6
    niveau7Name?: string; // Nom du niveau 7
    niveau8Name?: string; // Nom du niveau 8
    niveau9Name?: string; // Nom du niveau 9
    niveau10Name?: string; // Nom du niveau 10

    // Référence à l'objet Mendix original pour accès aux attributs
    originalMendixObject?: any; // Objet Mendix original (pour accès aux attributs si nécessaire)
}

// Structure pour les mois
export interface Month {
    id: string; // Identifiant court (Jan, Feb, etc.)
    name: string; // Nom complet (Janvier, Février, etc.)
    attr: any; // Attribut Mendix pour la valeur du mois courant
    prevAttr?: any; // Attribut Mendix pour la valeur du mois de l'année précédente (optionnel)
}

// Options de filtrage
export interface FilterOptions {
    machine?: string;
    atelier?: string;
    secteur?: string;
    minConsumption?: number;
    maxConsumption?: number;
}

// Options de tri
export interface SortOptions {
    field: string; // Champ sur lequel trier
    direction: "asc" | "desc"; // Direction du tri
}

// Options de pagination
export interface PaginationOptions {
    page: number;
    pageSize: number;
    totalItems: number;
}
