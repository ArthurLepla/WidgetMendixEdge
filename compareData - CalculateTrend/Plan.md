Je vais analyser comment votre widget **DetailsWidget** (VueDetails - CalculateTrend) gère les unités et la détection Double_IPE, puis expliquer comment adapter CompareData.

## 🔍 Analyse du système Smart de DetailsWidget

### 1. **Système d'unités Smart automatiques**

DetailsWidget utilise un système sophistiqué de résolution d'unités via `smartUnitUtils.ts` :

```typescript
// Extraction des variables Smart de l'asset
const smartVariables = extractSmartVariablesData(
    assetVariablesDataSource,
    variableNameAttr,
    variableUnitAttr,
    variableMetricTypeAttr,
    variableEnergyTypeAttr
);

// Résolution intelligente des unités IPE
const variants = getIPEVariantsFromVariables(smartVariables, targetIPEEnergy);
const baseIpeKgUnit = variants.find(v => v.metricType === 'IPE_kg')?.unit;
const baseIpeUnit = variants.find(v => v.metricType === 'IPE')?.unit;
```

### 2. **Détection Double_IPE**

La détection fonctionne en **2 étapes** :

#### Étape 1: Scanner les données pour détecter les types IPE
```typescript
// Dans use-features.ts
const hasIPE1Data = useMemo(() => {
    // Scan jusqu'à 100 items pour trouver IPE ou IPE_kg
    for (let i = 0; i < maxScan; i++) {
        const mt = metricTypeAttr?.get(it)?.value?.trim();
        const nameVal = NameAttr?.get(it)?.value;
        const mtFallback = getMetricTypeFromName(nameVal); // Fallback sur le nom
        const finalMt = (mt || mtFallback)?.toString();
        
        if (finalMt === METRIC_TYPES.IPE || finalMt === METRIC_TYPES.IPE_KG) {
            ipeCount++;
        }
    }
    return ipeCount > 0;
}, [...]);
```

#### Étape 2: Activer Double_IPE si feature ET données présentes
```typescript
const isDoubleIPEActive = isDoubleIPEEnabled && hasIPE2Data;
```

### 3. **Gestion des variables par asset (IPE_elec_Asset, IPE_gaz_Asset)**

Le système Smart gère cela via les **MetricType + EnergyType** :

```typescript
// Variables d'un asset peuvent avoir :
// - MetricType: IPE, IPE_kg, Conso, Prod
// - EnergyType: Elec, Gaz, Eau, Air

// Recherche de l'unité IPE pour une énergie spécifique
function findSmartVariableUnit(
    variables: SmartVariableData[],
    metricType: 'IPE',
    energyType: 'Elec' // Pour IPE_elec_Asset
): string {
    const variable = variables.find(v => 
        v.metricType === metricType && 
        v.energyType === energyType
    );
    return variable?.unit || '';
}
```

## 🔄 Comment adapter CompareData

### 1. **Ajouter le système Smart**

```typescript
// CompareData.tsx
import { extractSmartVariablesData, getSmartIPEUnits } from "./utils/smartUnitUtils";

// Extraction des variables Smart
const smartVariables = useMemo(() => {
    return extractSmartVariablesData(
        assetVariablesDataSource,
        variableNameAttr,
        variableUnitAttr,
        variableMetricTypeAttr,
        variableEnergyTypeAttr
    );
}, [assetVariablesDataSource, ...]);

// Résolution des unités IPE
const ipeUnits = useMemo(() => {
    if (detectedMode !== "ipe") return null;
    
    // Détection selon l'énergie configurée
    const targetEnergy = detectedEnergyType; // "Elec", "Gaz", etc.
    const variants = getIPEVariantsFromVariables(smartVariables, targetEnergy);
    
    return {
        ipe1Unit: variants.find(v => v.metricType === 'IPE_kg')?.unit || '',
        ipe2Unit: variants.find(v => v.metricType === 'IPE')?.unit || ''
    };
}, [smartVariables, detectedMode, detectedEnergyType]);
```

### 2. **Améliorer la détection Double_IPE**

```typescript
// Scan intelligent des données pour détecter les variantes IPE
const detectIPEVariants = (items: any[], metricTypeAttr: any) => {
    const variants = new Set<string>();
    const maxScan = Math.min(items.length, 100);
    
    for (let i = 0; i < maxScan; i++) {
        const metricType = metricTypeAttr?.get(items[i])?.value;
        if (metricType === 'IPE' || metricType === 'IPE_kg') {
            variants.add(metricType);
        }
    }
    
    return {
        hasIPE: variants.has('IPE'),
        hasIPEKg: variants.has('IPE_kg'),
        shouldEnableDouble: variants.size >= 2
    };
};
```

### 3. **Filtrage intelligent des données**

```typescript
// Dans ChartContainer
const filterDataByIPEVariant = (data: AssetData[], activeIPE: 1 | 2) => {
    const targetMetricType = activeIPE === 1 ? 'IPE_kg' : 'IPE';
    
    return data.filter(item => {
        // Si pas de metricType, essayer de déduire du nom
        const metricType = item.metricType || getMetricTypeFromName(item.name);
        return metricType === targetMetricType;
    });
};
```

### 4. **Affichage des labels IPE basés sur les unités**

```typescript
// Au lieu de "IPE Standard" / "IPE Kg", afficher les unités réelles
const IPEToggle = ({ ipe1Unit, ipe2Unit, activeIPE, onToggle }) => {
    return (
        <ToggleGroup.Root>
            <ToggleGroup.Item value="1">
                {ipe1Unit || "IPE 1"} {/* Ex: "kWh/kg" */}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="2">
                {ipe2Unit || "IPE 2"} {/* Ex: "kWh/pcs" */}
            </ToggleGroup.Item>
        </ToggleGroup.Root>
    );
};
```

## 📝 Résumé des adaptations nécessaires

| Composant | Modification | Priorité |
|-----------|-------------|----------|
| **CompareData.tsx** | Ajouter extraction variables Smart | 🔴 Haute |
| **ChartContainer.tsx** | Utiliser unités Smart pour les labels IPE | 🔴 Haute |
| **utils/** | Ajouter `smartUnitUtils.ts` | 🔴 Haute |
| **Détection IPE** | Scanner métadonnées pour variantes | 🟡 Moyenne |
| **Filtrage** | Séparer par MetricType exact | 🟡 Moyenne |

Le point clé est que DetailsWidget ne fait **jamais de hardcode** des unités - tout vient des variables Smart de l'asset, ce qui permet de gérer automatiquement les cas comme `IPE_elec_Asset`, `IPE_gaz_Asset`, etc.