# Types et Interfaces - Widget FAD Table

Ce document définit les principales structures de données et interfaces utilisées dans le widget FAD Table.

## Types de données

### Données de consommation

```typescript
/**
 * Représente une ligne de données dans le tableau FAD
 */
interface FadTableRow {
  id: string;             // Identifiant unique de la ligne (généré)
  machineName: string;    // Nom de la machine
  atelierName?: string;   // Nom de l'atelier (optionnel)
  secteurName?: string;   // Nom du secteur (optionnel)
  
  // Valeurs de consommation pour l'année N
  janValue?: number;      // Janvier
  febValue?: number;      // Février
  marValue?: number;      // Mars
  aprValue?: number;      // Avril
  mayValue?: number;      // Mai
  junValue?: number;      // Juin
  julValue?: number;      // Juillet
  augValue?: number;      // Août
  sepValue?: number;      // Septembre
  octValue?: number;      // Octobre
  novValue?: number;      // Novembre
  decValue?: number;      // Décembre
  totalYearValue?: number; // Total annuel
  
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
  isTotal?: boolean;        // Indique si la ligne est un total (pour Atelier/Secteur)
  totalType?: TotalType;    // Type de total (Atelier, Secteur, Global)
  parentId?: string;        // Identifiant du parent (pour le regroupement)
  isExpanded?: boolean;     // État d'expansion pour le regroupement
}

/**
 * Types de totaux possibles
 */
enum TotalType {
  ATELIER = 'atelier',
  SECTEUR = 'secteur',
  GLOBAL = 'global'
}
```

### Données agrégées

```typescript
/**
 * Structure pour stocker les totaux par Atelier
 */
interface AtelierTotal {
  atelierName: string;
  secteurName?: string;
  janValue: number;
  febValue: number;
  marValue: number;
  aprValue: number;
  mayValue: number;
  junValue: number;
  julValue: number;
  augValue: number;
  sepValue: number;
  octValue: number;
  novValue: number;
  decValue: number;
  totalYearValue: number;
  
  // Valeurs N-1 (optionnelles)
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
}

/**
 * Structure pour stocker les totaux par Secteur
 */
interface SecteurTotal {
  secteurName: string;
  janValue: number;
  febValue: number;
  marValue: number;
  aprValue: number;
  mayValue: number;
  junValue: number;
  julValue: number;
  augValue: number;
  sepValue: number;
  octValue: number;
  novValue: number;
  decValue: number;
  totalYearValue: number;
  
  // Valeurs N-1 (optionnelles)
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
}
```

## Configuration et états

```typescript
/**
 * État du hook useTableData
 */
interface TableDataState {
  originalData: FadTableRow[];      // Données originales non modifiées
  processedData: FadTableRow[];     // Données après traitement (tri, filtrage)
  atelierTotals: AtelierTotal[];    // Totaux par atelier
  secteurTotals: SecteurTotal[];    // Totaux par secteur
  globalTotals: {                   // Totaux globaux
    janValue: number;
    febValue: number;
    marValue: number;
    aprValue: number;
    mayValue: number;
    junValue: number;
    julValue: number;
    augValue: number;
    sepValue: number;
    octValue: number;
    novValue: number;
    decValue: number;
    totalYearValue: number;
    
    // Valeurs N-1 (optionnelles)
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
  };
  isLoading: boolean;              // Indique si les données sont en cours de chargement
  error: string | null;            // Message d'erreur éventuel
}

/**
 * Configuration pour les hooks de filtrage
 */
interface FilterConfig {
  searchTerm: string;             // Terme de recherche global
  selectedSecteurs: string[];     // Secteurs sélectionnés
  selectedAteliers: string[];     // Ateliers sélectionnés
  minValue?: number;              // Valeur minimale (pour filtrage par plage)
  maxValue?: number;              // Valeur maximale (pour filtrage par plage)
}

/**
 * Configuration pour les hooks de tri
 */
interface SortConfig {
  column: string;                 // Colonne à trier
  direction: 'asc' | 'desc';      // Direction du tri
}

/**
 * Configuration pour les hooks de pagination
 */
interface PaginationConfig {
  currentPage: number;            // Page actuelle
  itemsPerPage: number;           // Nombre d'éléments par page
  totalItems: number;             // Nombre total d'éléments
}
```

## Colonnes et configuration d'affichage

```typescript
/**
 * Définition d'une colonne du tableau
 */
interface TableColumn {
  id: string;                     // Identifiant unique de la colonne
  label: string;                  // Libellé affiché dans l'en-tête
  accessor: string;               // Propriété à accéder dans les données
  sortable?: boolean;             // Indique si la colonne est triable
  width?: string;                 // Largeur de la colonne (ex: "150px" ou "10%")
  align?: 'left' | 'center' | 'right'; // Alignement du contenu
  format?: (value: any) => string; // Fonction de formatage des valeurs
  isComparison?: boolean;         // Indique si c'est une colonne de comparaison N-1
  isGroupingColumn?: boolean;     // Indique si c'est une colonne de regroupement
}

/**
 * Configuration du widget FAD Table
 */
interface FadTableConfig {
  showTotals: boolean;            // Afficher les totaux
  enableExport: boolean;          // Activer l'export
  enableFilter: boolean;          // Activer le filtrage
  enableSort: boolean;            // Activer le tri
  enableComparison: boolean;      // Activer la comparaison N-1
  loadingStrategy: 'loadAll' | 'pagination' | 'lazyLoad'; // Stratégie de chargement
  pageSize: number;               // Taille de page
}
```

Ces définitions de types nous serviront de référence lors du développement et nous aideront à maintenir la cohérence et la type-safety dans notre code.

## Exemple d'utilisation

```typescript
// Exemple d'initialisation du hook useTableData
const tableData = useTableData({
  originalData: props.dsGridData.items?.map(mapMendixItemToFadRow) || [],
  showTotals: props.showTotals,
  enableComparison: props.enableComparison
});

// Exemple d'initialisation du hook useSorting
const sorting = useSorting({
  data: tableData.processedData,
  initialSortConfig: { column: 'machineName', direction: 'asc' },
  enableSort: props.enableSort
});

// Exemple d'initialisation du hook useFiltering
const filtering = useFiltering({
  data: sorting.sortedData,
  enableFilter: props.enableFilter
});

// Exemple d'initialisation du hook usePagination
const pagination = usePagination({
  data: filtering.filteredData,
  pageSize: props.pageSize,
  loadingStrategy: props.loadingStrategy
});

// Données finales à afficher
const dataToDisplay = pagination.paginatedData;
``` 