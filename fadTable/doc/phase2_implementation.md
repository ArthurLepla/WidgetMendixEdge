# Phase 2: Fonctionnalités de groupement et totaux - Plan d'implémentation

Ce document détaille les étapes spécifiques pour implémenter la Phase 2 du widget FAD Table.

## Objectifs de la Phase 2

1. Implémenter le regroupement des données par Secteur et Atelier
2. Calculer les totaux par Secteur et Atelier
3. Calculer les totaux par mois
4. Afficher les totaux dans le pied de tableau

## Étapes d'implémentation

### 1. Amélioration de la structure des données

Nous devons modifier notre hook `useTableData` pour qu'il calcule et organise les totaux :

#### `src/utils/calculations.ts`

```typescript
// calculations.ts
import { FadTableRow, TotalType } from "../types";

/**
 * Calcule les totaux mensuels pour un ensemble de lignes
 * @param rows Lignes de données
 * @param identifier Identifiant pour le total (nom du secteur ou de l'atelier)
 * @param parentId Identifiant du parent pour les totaux par atelier
 * @param totalType Type de total (SECTEUR, ATELIER, GLOBAL)
 * @returns Ligne de total calculée
 */
export function calculateTotals(
  rows: FadTableRow[],
  identifier: string,
  parentId?: string,
  totalType: TotalType = TotalType.GLOBAL
): FadTableRow {
  // Initialiser un objet pour stocker les totaux
  const totals: Record<string, number> = {
    janValue: 0, febValue: 0, marValue: 0, aprValue: 0,
    mayValue: 0, junValue: 0, julValue: 0, augValue: 0,
    sepValue: 0, octValue: 0, novValue: 0, decValue: 0,
    totalYearValue: 0,
    
    // N-1 values
    prevJanValue: 0, prevFebValue: 0, prevMarValue: 0, prevAprValue: 0,
    prevMayValue: 0, prevJunValue: 0, prevJulValue: 0, prevAugValue: 0,
    prevSepValue: 0, prevOctValue: 0, prevNovValue: 0, prevDecValue: 0,
    prevTotalYearValue: 0
  };

  // Parcourir toutes les lignes et additionner les valeurs
  rows.forEach(row => {
    // Ignorer les lignes qui sont déjà des totaux
    if (row.isTotal) return;
    
    // Additionner chaque valeur mensuelle si elle existe
    Object.keys(totals).forEach(key => {
      if (row[key] !== undefined && row[key] !== null) {
        totals[key] += row[key] || 0;
      }
    });
  });

  // Créer une ligne de total
  const totalRow: FadTableRow = {
    id: `total-${totalType.toLowerCase()}-${identifier}`,
    machineName: totalType === TotalType.GLOBAL 
      ? "Total Général" 
      : (totalType === TotalType.SECTEUR 
        ? `Total Secteur: ${identifier}` 
        : `Total Atelier: ${identifier}`),
    secteurName: totalType === TotalType.ATELIER ? parentId : (totalType === TotalType.SECTEUR ? identifier : ""),
    atelierName: totalType === TotalType.ATELIER ? identifier : "",
    isTotal: true,
    totalType,
    parentId,
    
    // Affecter les valeurs calculées
    janValue: totals.janValue,
    febValue: totals.febValue,
    marValue: totals.marValue,
    aprValue: totals.aprValue,
    mayValue: totals.mayValue,
    junValue: totals.junValue,
    julValue: totals.julValue,
    augValue: totals.augValue,
    sepValue: totals.sepValue,
    octValue: totals.octValue,
    novValue: totals.novValue,
    decValue: totals.decValue,
    totalYearValue: totals.totalYearValue,
    
    // N-1 values
    prevJanValue: totals.prevJanValue,
    prevFebValue: totals.prevFebValue,
    prevMarValue: totals.prevMarValue,
    prevAprValue: totals.prevAprValue,
    prevMayValue: totals.prevMayValue,
    prevJunValue: totals.prevJunValue,
    prevJulValue: totals.prevJulValue,
    prevAugValue: totals.prevAugValue,
    prevSepValue: totals.prevSepValue,
    prevOctValue: totals.prevOctValue,
    prevNovValue: totals.prevNovValue,
    prevDecValue: totals.prevDecValue,
    prevTotalYearValue: totals.prevTotalYearValue
  };

  return totalRow;
}

/**
 * Organise les données en groupes par Secteur et Atelier
 * @param rows Lignes de données originales
 * @param showTotals Indique si les totaux doivent être inclus
 * @returns Données organisées avec totaux
 */
export function organizeDataByHierarchy(
  rows: FadTableRow[],
  showTotals: boolean = true
): FadTableRow[] {
  if (!showTotals) return rows;
  
  // Filtrer les lignes qui ne sont pas déjà des totaux
  const dataRows = rows.filter(row => !row.isTotal);
  
  // Regrouper par secteur
  const secteurGroups: Record<string, FadTableRow[]> = {};
  const noSecteurRows: FadTableRow[] = [];
  
  // Première passe : classer les lignes par secteur
  dataRows.forEach(row => {
    if (row.secteurName) {
      if (!secteurGroups[row.secteurName]) {
        secteurGroups[row.secteurName] = [];
      }
      secteurGroups[row.secteurName].push(row);
    } else {
      noSecteurRows.push(row);
    }
  });
  
  // Deuxième passe : pour chaque secteur, regrouper par atelier
  const result: FadTableRow[] = [];
  
  Object.entries(secteurGroups).forEach(([secteurName, secteurRows]) => {
    // Regrouper les lignes de ce secteur par atelier
    const atelierGroups: Record<string, FadTableRow[]> = {};
    const noAtelierRows: FadTableRow[] = [];
    
    secteurRows.forEach(row => {
      if (row.atelierName) {
        if (!atelierGroups[row.atelierName]) {
          atelierGroups[row.atelierName] = [];
        }
        atelierGroups[row.atelierName].push(row);
      } else {
        noAtelierRows.push(row);
      }
    });
    
    // Ajouter les lignes des ateliers avec leurs totaux
    Object.entries(atelierGroups).forEach(([atelierName, atelierRows]) => {
      result.push(...atelierRows);
      
      // Ajouter le total de l'atelier
      if (showTotals) {
        const atelierTotal = calculateTotals(atelierRows, atelierName, secteurName, TotalType.ATELIER);
        result.push(atelierTotal);
      }
    });
    
    // Ajouter les lignes sans atelier
    result.push(...noAtelierRows);
    
    // Ajouter le total du secteur
    if (showTotals) {
      const secteurTotal = calculateTotals(secteurRows, secteurName, undefined, TotalType.SECTEUR);
      result.push(secteurTotal);
    }
  });
  
  // Ajouter les lignes sans secteur
  result.push(...noSecteurRows);
  
  // Ajouter le total général
  if (showTotals) {
    const grandTotal = calculateTotals(dataRows, "Global", undefined, TotalType.GLOBAL);
    result.push(grandTotal);
  }
  
  return result;
}

/**
 * Calcule les totaux annuels à partir des valeurs mensuelles
 * @param rows Lignes de données
 * @returns Lignes avec totaux annuels calculés
 */
export function calculateYearlyTotals(rows: FadTableRow[]): FadTableRow[] {
  return rows.map(row => {
    // Si totalYearValue est déjà défini, ne pas le recalculer
    if (row.totalYearValue !== undefined) return row;
    
    // Sinon, calculer le total annuel à partir des valeurs mensuelles
    const total = [
      row.janValue, row.febValue, row.marValue, row.aprValue,
      row.mayValue, row.junValue, row.julValue, row.augValue,
      row.sepValue, row.octValue, row.novValue, row.decValue
    ].reduce((sum, val) => sum + (val || 0), 0);
    
    // De même pour les valeurs N-1
    const prevTotal = [
      row.prevJanValue, row.prevFebValue, row.prevMarValue, row.prevAprValue,
      row.prevMayValue, row.prevJunValue, row.prevJulValue, row.prevAugValue,
      row.prevSepValue, row.prevOctValue, row.prevNovValue, row.prevDecValue
    ].reduce((sum, val) => sum + (val || 0), 0);
    
    return {
      ...row,
      totalYearValue: total,
      prevTotalYearValue: prevTotal || undefined
    };
  });
}
```

### 2. Mise à jour du hook useTableData

Nous devons mettre à jour notre hook `useTableData` pour utiliser les nouvelles fonctions de calcul :

#### `src/hooks/useTableData.ts`

```typescript
// useTableData.ts
import { useState, useEffect } from "react";
import { FadTableRow } from "../types";
import { FadTableContainerProps } from "../../typings/FadTableProps";
import { mapMendixItemToFadRow } from "../utils/dataFormatters";
import { organizeDataByHierarchy, calculateYearlyTotals } from "../utils/calculations";

/**
 * Interface des propriétés pour le hook useTableData
 */
interface UseTableDataProps {
  rawData: any[];
  props: FadTableContainerProps;
}

/**
 * Interface de retour pour le hook useTableData
 */
interface UseTableDataReturn {
  data: FadTableRow[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour gérer les données du tableau FAD
 * @param param0 Propriétés
 * @returns Données traitées, état de chargement et erreurs éventuelles
 */
export function useTableData({ rawData, props }: UseTableDataProps): UseTableDataReturn {
  const [data, setData] = useState<FadTableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Si pas de données, renvoyer un tableau vide
      if (!rawData || rawData.length === 0) {
        setData([]);
        setIsLoading(false);
        return;
      }

      // Convertir les données Mendix en FadTableRow
      const mappedData = rawData.map(item => mapMendixItemToFadRow(item, props));
      
      // Calculer les totaux annuels si nécessaire
      const dataWithYearlyTotals = calculateYearlyTotals(mappedData);
      
      // Organiser les données par hiérarchie et calculer les totaux
      const processedData = organizeDataByHierarchy(
        dataWithYearlyTotals, 
        props.showTotals
      );
      
      setData(processedData);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erreur lors du traitement des données: ${errorMessage}`);
      setIsLoading(false);
      console.error("Erreur dans useTableData:", err);
    }
  }, [rawData, props]);

  return { data, isLoading, error };
}
```

### 3. Création du composant TableFooter

Créons un composant pour afficher le pied de tableau avec les totaux :

#### `src/components/DataTable/TableFooter.tsx`

```typescript
// TableFooter.tsx
import { ReactElement, createElement } from "react";
import { Table } from "@mantine/core";
import { FadTableRow, TableColumn, TotalType } from "../../types";
import { formatNumber } from "../../utils/dataFormatters";

interface TableFooterProps {
  data: FadTableRow[];
  columns: TableColumn[];
}

/**
 * Composant pour le pied de tableau affichant le total général
 * @param param0 Propriétés
 * @returns Élément React
 */
export function TableFooter({ data, columns }: TableFooterProps): ReactElement | null {
  // Trouver le total général dans les données
  const grandTotal = data.find(row => row.isTotal && row.totalType === TotalType.GLOBAL);
  
  // Si pas de total, ne pas afficher le pied de tableau
  if (!grandTotal) return null;
  
  return (
    <Table.Tfoot>
      <Table.Tr>
        {columns.map(column => (
          <Table.Th 
            key={`footer-${column.id}`}
            style={{ 
              textAlign: column.align || "left",
              backgroundColor: "#f0f0f0"
            }}
          >
            {column.accessor === "machineName" 
              ? "Total Général"
              : renderCellValue(grandTotal, column)}
          </Table.Th>
        ))}
      </Table.Tr>
    </Table.Tfoot>
  );
}

/**
 * Fonction pour rendre la valeur d'une cellule avec le formatage approprié
 * @param row Ligne de données
 * @param column Définition de la colonne
 * @returns Valeur formatée
 */
function renderCellValue(row: any, column: any): string | number | ReactElement {
  const value = row[column.accessor];
  
  // Ignorer les colonnes non numériques autres que machineName
  if (column.accessor === "secteurName" || column.accessor === "atelierName") {
    return "";
  }
  
  // Si une fonction de formatage est fournie, l'utiliser
  if (column.format && typeof column.format === "function") {
    return column.format(value);
  }
  
  // Formatage par défaut pour les nombres
  if (typeof value === "number") {
    return formatNumber(value);
  }
  
  // Valeur par défaut pour les valeurs nulles ou undefined
  if (value === null || value === undefined) {
    return "-";
  }
  
  return value;
}
```

### 4. Mise à jour de l'export de DataTable

Mettons à jour le fichier `index.tsx` pour exporter le nouveau composant :

#### `src/components/DataTable/index.tsx`

```typescript
// index.tsx
export { DataTable } from "./DataTable";
export { TableHeader } from "./TableHeader";
export { TableBody } from "./TableBody";
export { TableFooter } from "./TableFooter";
export type { DataTableProps, TableHeaderProps, TableBodyProps } from "./types";
```

### 5. Mise à jour du composant DataTable

Nous devons mettre à jour le composant DataTable pour inclure le pied de tableau :

#### `src/components/DataTable/DataTable.tsx`

```typescript
// DataTable.tsx
import { ReactElement, createElement } from "react";
import { Table, LoadingOverlay, Alert } from "@mantine/core";
import { DataTableProps } from "./types";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TableFooter } from "./TableFooter";

/**
 * Composant principal de tableau de données
 * @param param0 Propriétés
 * @returns Élément React
 */
export function DataTable({ data, columns, isLoading, error }: DataTableProps): ReactElement {
  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div style={{ position: "relative", minHeight: "50px" }}>
        <LoadingOverlay visible />
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <Alert color="red" title="Erreur">
        {error}
      </Alert>
    );
  }

  // Afficher le tableau avec les données
  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <TableHeader columns={columns} />
      <TableBody data={data} columns={columns} />
      <TableFooter data={data} columns={columns} />
    </Table>
  );
}
```

### 6. Mise à jour du composant TableBody

Nous devons modifier le composant TableBody pour gérer l'affichage spécial des lignes de totaux :

#### `src/components/DataTable/TableBody.tsx`

```typescript
// TableBody.tsx
import { ReactElement, createElement } from "react";
import { Table, Text } from "@mantine/core";
import { TableBodyProps } from "./types";
import { formatNumber } from "../../utils/dataFormatters";
import { TotalType } from "../../types";

/**
 * Composant pour le corps du tableau
 * @param param0 Propriétés
 * @returns Élément React
 */
export function TableBody({ data, columns }: TableBodyProps): ReactElement {
  // Si aucune donnée, afficher un message
  if (data.length === 0) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={columns.length} style={{ textAlign: "center" }}>
            Aucune donnée disponible.
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  // Afficher les données
  return (
    <Table.Tbody>
      {data.map(row => {
        // Déterminer le style de la ligne en fonction du type de total
        const rowStyle: React.CSSProperties = {};
        const textWeight = "normal";
        
        if (row.isTotal) {
          switch(row.totalType) {
            case TotalType.ATELIER:
              rowStyle.backgroundColor = "#f9f9f9";
              break;
            case TotalType.SECTEUR:
              rowStyle.backgroundColor = "#f0f0f0";
              break;
            case TotalType.GLOBAL:
              // Le total global est affiché dans le pied de tableau
              return null;
          }
        }
        
        return (
          <Table.Tr key={row.id} style={rowStyle}>
            {columns.map(column => {
              // Ajuster l'affichage en fonction du type de colonne et de ligne
              let cellStyle: React.CSSProperties = { 
                textAlign: column.align || "left",
                fontWeight: row.isTotal ? "bold" : textWeight
              };
              
              // Pour les lignes de totaux, ne pas afficher certaines colonnes
              if (row.isTotal) {
                if (row.totalType === TotalType.SECTEUR && 
                    (column.accessor === "atelierName" || 
                     (column.accessor === "machineName" && row.secteurName))) {
                  return (
                    <Table.Td key={`${row.id}-${column.id}`} style={cellStyle}>
                      {column.accessor === "machineName" ? `Total Secteur: ${row.secteurName}` : ""}
                    </Table.Td>
                  );
                }
                
                if (row.totalType === TotalType.ATELIER && 
                    column.accessor === "machineName") {
                  return (
                    <Table.Td key={`${row.id}-${column.id}`} style={cellStyle}>
                      {`Total Atelier: ${row.atelierName}`}
                    </Table.Td>
                  );
                }
              }
              
              return (
                <Table.Td 
                  key={`${row.id}-${column.id}`}
                  style={cellStyle}
                >
                  {renderCellValue(row, column)}
                </Table.Td>
              );
            })}
          </Table.Tr>
        );
      })}
    </Table.Tbody>
  );
}

/**
 * Fonction pour rendre la valeur d'une cellule avec le formatage approprié
 * @param row Ligne de données
 * @param column Définition de la colonne
 * @returns Valeur formatée
 */
function renderCellValue(row: any, column: any): string | number | ReactElement {
  const value = row[column.accessor];
  
  // Si la ligne est un total et que c'est une colonne de secteur/atelier
  if (row.isTotal) {
    if (column.accessor === "secteurName" || column.accessor === "atelierName") {
      return "";
    }
  }
  
  // Si une fonction de formatage est fournie, l'utiliser
  if (column.format && typeof column.format === "function") {
    return column.format(value);
  }
  
  // Formatage par défaut pour les nombres
  if (typeof value === "number") {
    return formatNumber(value);
  }
  
  // Valeur par défaut pour les valeurs nulles ou undefined
  if (value === null || value === undefined) {
    return "-";
  }
  
  return value;
}
```

## Plan de test

Une fois ces étapes implémentées, nous devrons tester :

1. Calcul correct des totaux par Secteur et Atelier
2. Affichage des totaux dans le tableau avec le style approprié
3. Affichage du total général dans le pied de tableau
4. Comportement correct avec différentes combinaisons de données
5. Option pour activer/désactiver les totaux via la propriété showTotals

## Livrables de la Phase 2

- Fonctions de calcul de totaux
- Regroupement des données par hiérarchie
- Composant TableFooter pour afficher le total général
- Mise à jour du composant TableBody pour afficher les totaux partiels
- Hook useTableData amélioré pour traiter les totaux

## Étapes suivantes (Phase 3)

- Implémentation du tri des colonnes
- Mise en place des filtres de recherche 
- Développement des contrôles de filtrage 