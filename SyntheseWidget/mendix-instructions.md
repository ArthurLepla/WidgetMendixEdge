# Instructions pour la création du Widget Mendix SyntheseWidget

## 1. Configuration XML du Widget

### Étape 1.1 - Configuration des Data Sources
Modifier le fichier `src/SyntheseWidget.xml` pour définir :

```xml
<?xml version="1.0" encoding="utf-8"?>
<widget id="com.mycompany.synthesewidget" pluginWidget="true" needsEntityContext="true" offlineCapable="true">
    <name>Synthese Widget</name>
    <description>Widget de synthèse énergétique</description>
    <properties>
        <!-- Data Source Usine -->
        <propertyGroup caption="Data Source Usine">
            <property key="dsUsine" type="datasource" required="true">
                <caption>Data Source Usine</caption>
                <description>Sélectionner la source de données pour l'usine</description>
            </property>
            <property key="attrTotalConsoElec" type="attribute" datasource="dsUsine" required="true">
                <caption>Total Conso Électricité</caption>
                <description>Consommation totale électricité</description>
                <attributeTypes>
                    <attributeType name="Decimal"/>
                </attributeTypes>
            </property>
            <!-- Répéter pour Gaz, Eau, Air -->
            <!-- Ajouter les attributs Period Prec -->
        </propertyGroup>

        <!-- Data Source Secteurs -->
        <propertyGroup caption="Data Source Secteurs">
            <property key="dsSecteurs" type="datasource" isList="true" required="true">
                <caption>Data Source Secteurs</caption>
                <description>Sélectionner la source de données pour les secteurs</description>
            </property>
            <!-- Attributs similaires pour les secteurs -->
        </propertyGroup>

        <!-- Date Range Properties -->
        <propertyGroup caption="Date Range">
            <property key="dateDebut" type="attribute" required="true">
                <caption>Date Début</caption>
                <description>Date de début de la période</description>
                <attributeTypes>
                    <attributeType name="DateTime"/>
                </attributeTypes>
            </property>
            <property key="dateFin" type="attribute" required="true">
                <caption>Date Fin</caption>
                <description>Date de fin de la période</description>
                <attributeTypes>
                    <attributeType name="DateTime"/>
                </attributeTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>
```

## 2. Structure des Composants

### Étape 2.1 - Création des Types (src/typings/)
Créer `SyntheseWidgetProps.d.ts` avec les interfaces suivantes :

```typescript
export interface UsineData {
    totalConsoElec: number;
    totalConsoGaz: number;
    totalConsoEau: number;
    totalConsoAir: number;
    totalConsoElecPeriodPrec: number;
    totalConsoGazPeriodPrec: number;
    totalConsoEauPeriodPrec: number;
    totalConsoAirPeriodPrec: number;
}

export interface SecteurData {
    name: string;
    totalConsoElec: number;
    totalConsoGaz: number;
    totalConsoEau: number;
    totalConsoAir: number;
}

// Autres interfaces nécessaires
```

### Étape 2.2 - Création des Composants

#### DPE.tsx
```typescript
// src/components/DPE.tsx
import { createElement } from "react";

export interface DPEProps {
    grade: string;
    value: number;
}

export const DPE = ({ grade, value }: DPEProps): JSX.Element => {
    // Code du DPE original
};
```

#### CardConsoTotal.tsx
```typescript
// src/components/CardConsoTotal.tsx
import { createElement } from "react";
import { UsineData } from "../typings/SyntheseWidgetProps";

export interface CardConsoTotalProps {
    data: UsineData;
}

export const CardConsoTotal = ({ data }: CardConsoTotalProps): JSX.Element => {
    // Code adapté du composant EnergyMetric original
};
```

#### ColumnChart.tsx
```typescript
// src/components/ColumnChart.tsx
import { createElement } from "react";
import { SecteurData } from "../typings/SyntheseWidgetProps";

export interface ColumnChartProps {
    data: SecteurData[];
}

export const ColumnChart = ({ data }: ColumnChartProps): JSX.Element => {
    // Code adapté du BarChart original
};
```

#### SecteurConsoCard.tsx
```typescript
// src/components/SecteurConsoCard.tsx
import { createElement } from "react";
import { SecteurData } from "../typings/SyntheseWidgetProps";

export interface SecteurConsoCardProps {
    data: SecteurData;
}

export const SecteurConsoCard = ({ data }: SecteurConsoCardProps): JSX.Element => {
    // Code adapté pour les cartes secteur
};
```

### Étape 2.3 - Assemblage dans SyntheseWidget.tsx
```typescript
// src/components/SyntheseWidget.tsx
import { createElement, useEffect, useState } from "react";
import { DPE } from "./DPE";
import { CardConsoTotal } from "./CardConsoTotal";
import { ColumnChart } from "./ColumnChart";
import { SecteurConsoCard } from "./SecteurConsoCard";

export function SyntheseWidget({ 
    dsUsine, 
    dsSecteurs,
    dateDebut,
    dateFin 
}: SyntheseWidgetContainerProps) {
    // Logique de gestion des données et du state
    return (
        // Assemblage des composants
    );
}
```

## 3. Implémentation des Fonctionnalités Spécifiques

### Étape 3.1 - Gestion des Dates
```typescript
// Fonction utilitaire pour la gestion des dates
const handleDateRangeChange = (range: 'day' | 'week' | 'month') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch(range) {
        case 'day':
            start.setHours(0,0,0,0);
            end.setHours(23,59,59,999);
            break;
        case 'week':
            // Logique pour la semaine
            break;
        case 'month':
            // Logique pour le mois
            break;
    }

    // Mise à jour des attributs Mendix
    dateDebut.setValue(start);
    dateFin.setValue(end);
};
```

## 4. Styles et Configuration

### Étape 4.1 - Configuration des Styles
```typescript
// src/ui/SyntheseWidget.css
// Définir les styles nécessaires
```

## Notes Importantes
1. Tous les composants doivent utiliser createElement au lieu de JSX
2. Les imports doivent suivre les conventions Mendix
3. Utiliser les hooks Mendix pour la gestion des données
4. Implémenter la gestion d'erreurs et les états de chargement
5. Tester chaque composant individuellement

## Ordre d'Implémentation Recommandé
1. Configuration XML
2. Types et interfaces
3. Composants individuels
4. Logique de dates
5. Assemblage final
6. Tests et débogage