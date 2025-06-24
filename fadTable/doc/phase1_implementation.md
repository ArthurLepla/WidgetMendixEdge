# Phase 1: Structure de base et affichage des données - Plan d'implémentation

Ce document détaille les étapes spécifiques pour implémenter la Phase 1 du widget FAD Table.

## Objectifs de la Phase 1

1. Créer la structure de dossiers et l'architecture de base
2. Mettre en place le composant de tableau principal
3. Traiter les données fournies par Mendix
4. Afficher les données dans un format de base

## Étapes d'implémentation

### 1. Création de la structure de dossiers

```
mkdir -p src/components/DataTable
mkdir -p src/components/Filters
mkdir -p src/components/Export
mkdir -p src/components/Pagination
mkdir -p src/utils
mkdir -p src/hooks
```

### 2. Définition des types de base

Créer un fichier `src/types.ts` contenant les interfaces et types de base pour le widget.

```typescript
// types.ts
export interface FadTableRow {
  id: string;
  machineName: string;
  atelierName?: string;
  secteurName?: string;
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
  // Autres propriétés selon les besoins
}

export enum TotalType {
  ATELIER = 'atelier',
  SECTEUR = 'secteur',
  GLOBAL = 'global'
}

export interface TableColumn {
  id: string;
  label: string;
  accessor: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}
```

### 3. Implémentation des utilitaires de formatage

Créer un fichier `src/utils/dataFormatters.ts` pour les fonctions de formatage des données.

```typescript
// dataFormatters.ts
export function formatNumber(value?: number): string {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex] || '';
}

export function mapMendixItemToFadRow(item: any, props: any): FadTableRow {
  return {
    id: item.id,
    machineName: props.attrMachineName?.get(item).value || 'N/A',
    atelierName: props.attrAtelierName?.get(item).value || '',
    secteurName: props.attrSecteurName?.get(item).value || '',
    janValue: props.attrJanValue?.get(item).value?.toNumber(),
    febValue: props.attrFebValue?.get(item).value?.toNumber(),
    marValue: props.attrMarValue?.get(item).value?.toNumber(),
    aprValue: props.attrAprValue?.get(item).value?.toNumber(),
    mayValue: props.attrMayValue?.get(item).value?.toNumber(),
    junValue: props.attrJunValue?.get(item).value?.toNumber(),
    julValue: props.attrJulValue?.get(item).value?.toNumber(),
    augValue: props.attrAugValue?.get(item).value?.toNumber(),
    sepValue: props.attrSepValue?.get(item).value?.toNumber(),
    octValue: props.attrOctValue?.get(item).value?.toNumber(),
    novValue: props.attrNovValue?.get(item).value?.toNumber(),
    decValue: props.attrDecValue?.get(item).value?.toNumber(),
    totalYearValue: props.attrTotalYearValue?.get(item).value?.toNumber()
  };
}
```

### 4. Création du hook de gestion des données

Créer un fichier `src/hooks/useTableData.ts` pour gérer les données du tableau.

```typescript
// useTableData.ts
import { useState, useEffect } from 'react';
import { FadTableRow } from '../types';

interface UseTableDataProps {
  rawData: any[];
  props: any;
}

interface UseTableDataReturn {
  data: FadTableRow[];
  isLoading: boolean;
  error: string | null;
}

export function useTableData({ rawData, props }: UseTableDataProps): UseTableDataReturn {
  const [data, setData] = useState<FadTableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!rawData || rawData.length === 0) {
        setData([]);
        setIsLoading(false);
        return;
      }

      const mappedData = rawData.map(item => mapMendixItemToFadRow(item, props));
      setData(mappedData);
      setIsLoading(false);
    } catch (err) {
      setError(`Erreur lors du traitement des données: ${err}`);
      setIsLoading(false);
    }
  }, [rawData, props]);

  return { data, isLoading, error };
}
```

### 5. Implémentation du composant de tableau de base

Créer les fichiers nécessaires pour le composant DataTable :

#### `src/components/DataTable/types.ts`

```typescript
// types.ts
import { FadTableRow, TableColumn } from '../../types';

export interface DataTableProps {
  data: FadTableRow[];
  columns: TableColumn[];
  isLoading: boolean;
  error?: string | null;
}

export interface TableHeaderProps {
  columns: TableColumn[];
}

export interface TableBodyProps {
  data: FadTableRow[];
  columns: TableColumn[];
}
```

#### `src/components/DataTable/TableHeader.tsx`

```typescript
// TableHeader.tsx
import { ReactElement, createElement } from "react";
import { Table } from "@mantine/core";
import { TableHeaderProps } from "./types";

export function TableHeader({ columns }: TableHeaderProps): ReactElement {
  return (
    <Table.Thead>
      <Table.Tr>
        {columns.map(column => (
          <Table.Th 
            key={column.id}
            style={{ 
              width: column.width,
              textAlign: column.align || 'left'
            }}
          >
            {column.label}
          </Table.Th>
        ))}
      </Table.Tr>
    </Table.Thead>
  );
}
```

#### `src/components/DataTable/TableBody.tsx`

```typescript
// TableBody.tsx
import { ReactElement, createElement } from "react";
import { Table } from "@mantine/core";
import { TableBodyProps } from "./types";
import { formatNumber } from "../../utils/dataFormatters";

export function TableBody({ data, columns }: TableBodyProps): ReactElement {
  // Si aucune donnée, afficher un message
  if (data.length === 0) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={columns.length} style={{ textAlign: 'center' }}>
            Aucune donnée disponible.
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  // Afficher les données
  return (
    <Table.Tbody>
      {data.map(row => (
        <Table.Tr key={row.id}>
          {columns.map(column => (
            <Table.Td 
              key={`${row.id}-${column.id}`}
              style={{ 
                textAlign: column.align || 'left'
              }}
            >
              {renderCellValue(row, column)}
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}

function renderCellValue(row: any, column: any): string | number | ReactElement {
  const value = row[column.accessor];
  
  // Si une fonction de formatage est fournie, l'utiliser
  if (column.format && typeof column.format === 'function') {
    return column.format(value);
  }
  
  // Formatage par défaut pour les nombres
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  
  // Valeur par défaut pour les valeurs nulles ou undefined
  if (value === null || value === undefined) {
    return '-';
  }
  
  return value;
}
```

#### `src/components/DataTable/DataTable.tsx`

```typescript
// DataTable.tsx
import { ReactElement, createElement } from "react";
import { Table, LoadingOverlay, Alert } from "@mantine/core";
import { DataTableProps } from "./types";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";

export function DataTable({ data, columns, isLoading, error }: DataTableProps): ReactElement {
  if (isLoading) {
    return (
      <div style={{ position: "relative", minHeight: "50px" }}>
        <LoadingOverlay visible />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur">
        {error}
      </Alert>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <TableHeader columns={columns} />
      <TableBody data={data} columns={columns} />
    </Table>
  );
}
```

#### `src/components/DataTable/index.tsx`

```typescript
// index.tsx
export { DataTable } from './DataTable';
export type { DataTableProps } from './types';
```

### 6. Mise à jour du fichier principal FadTable.tsx

Mettre à jour le fichier principal pour utiliser les nouveaux composants et hooks :

```typescript
// FadTable.tsx
import { ReactElement, createElement, useMemo } from "react";
import { ValueStatus } from "mendix";
import { FadTableContainerProps } from "../typings/FadTableProps";
import { MantineProvider } from "@mantine/core";
import { DataTable } from "./components/DataTable";
import { TableColumn } from "./types";
import { useTableData } from "./hooks/useTableData";
import { formatNumber, getMonthName } from "./utils/dataFormatters";

import "./ui/FadTable.css";

export function FadTable(props: FadTableContainerProps): ReactElement {
  // Définition des colonnes du tableau
  const columns: TableColumn[] = useMemo(() => [
    { id: "secteur", label: "Secteur", accessor: "secteurName", width: "150px" },
    { id: "atelier", label: "Atelier", accessor: "atelierName", width: "150px" },
    { id: "machine", label: "Machine", accessor: "machineName", width: "200px" },
    { id: "jan", label: "Janvier", accessor: "janValue", align: "right", format: formatNumber },
    { id: "feb", label: "Février", accessor: "febValue", align: "right", format: formatNumber },
    { id: "mar", label: "Mars", accessor: "marValue", align: "right", format: formatNumber },
    { id: "apr", label: "Avril", accessor: "aprValue", align: "right", format: formatNumber },
    { id: "may", label: "Mai", accessor: "mayValue", align: "right", format: formatNumber },
    { id: "jun", label: "Juin", accessor: "junValue", align: "right", format: formatNumber },
    { id: "jul", label: "Juillet", accessor: "julValue", align: "right", format: formatNumber },
    { id: "aug", label: "Août", accessor: "augValue", align: "right", format: formatNumber },
    { id: "sep", label: "Septembre", accessor: "sepValue", align: "right", format: formatNumber },
    { id: "oct", label: "Octobre", accessor: "octValue", align: "right", format: formatNumber },
    { id: "nov", label: "Novembre", accessor: "novValue", align: "right", format: formatNumber },
    { id: "dec", label: "Décembre", accessor: "decValue", align: "right", format: formatNumber },
    { id: "total", label: "Total Annuel", accessor: "totalYearValue", align: "right", format: formatNumber },
  ], []);

  // Vérification du statut des données Mendix
  if (props.dsGridData.status === ValueStatus.Loading) {
    return (
      <MantineProvider>
        <DataTable data={[]} columns={columns} isLoading={true} />
      </MantineProvider>
    );
  }

  if (props.dsGridData.status === ValueStatus.Unavailable) {
    return (
      <MantineProvider>
        <DataTable 
          data={[]} 
          columns={columns} 
          isLoading={false} 
          error="Impossible de charger les données."
        />
      </MantineProvider>
    );
  }

  // Traitement des données si elles sont disponibles
  const { data, isLoading, error } = useTableData({
    rawData: props.dsGridData.items || [],
    props
  });

  return (
    <MantineProvider>
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error}
      />
    </MantineProvider>
  );
}
```

## Plan de test

Une fois ces étapes implémentées, nous devrons tester :

1. Affichage correct des données
2. Gestion des états de chargement
3. Gestion des erreurs
4. Formatage des nombres
5. Comportement avec différentes quantités de données

## Livrables de la Phase 1

- Structure de dossiers et fichiers mise en place
- Types de base définis
- Utilitaires de formatage fonctionnels
- Hook de gestion des données implémenté
- Composant de tableau de base fonctionnel affichant les données

## Étapes suivantes (Phase 2)

- Implémentation du regroupement par Secteur et Atelier
- Calcul et affichage des totaux
- Ajout d'un pied de tableau pour les totaux 